import { useMemo } from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import BackLink from "../../components/BackLink";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Skeleton from "../../components/Skeleton";
import Conversation from "../../components/chat/Conversation";
import StatusBadge from "../../components/tickets/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { useMarkRead } from "../../hooks/useMarkRead";
import { useTicket } from "../../hooks/useTicket";

/** Staff view of one ticket's conversation, below the admin header (4rem). */
export default function StaffThread({ ticketId }) {
  const { firebaseUser, profile } = useAuth();
  const { ticket, loading, notFound, error, retry } = useTicket(ticketId);
  const viewer = useMemo(
    () => ({ uid: firebaseUser?.uid, name: profile?.name ?? "", role: "staff" }),
    [firebaseUser?.uid, profile?.name],
  );

  useMarkRead({ ticketId: ticket?.id, side: "staff", unreadCount: ticket?.unreadStaff ?? 0 });

  let content;
  if (loading) {
    content = (
      <div aria-busy="true" aria-label="Loading ticket" className="space-y-3 p-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-12 w-2/3 rounded-2xl" />
      </div>
    );
  } else if (notFound) {
    content = (
      <div className="p-4">
        <EmptyState
          icon={SearchX}
          title="Ticket not found"
          message="It may have been removed."
          action={
            <Link
              to="/admin/inbox"
              className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Back to inbox
            </Link>
          }
        />
      </div>
    );
  } else if (error) {
    content = (
      <div className="p-4">
        <ErrorState title="We couldn't load this ticket" onRetry={retry} />
      </div>
    );
  } else {
    content = (
      <Conversation
        ticket={ticket}
        viewer={viewer}
        emptyText="No replies yet. Be the first to respond."
      />
    );
  }

  return (
    <section
      aria-labelledby="staff-thread-heading"
      className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col bg-slate-50 sm:border-x sm:border-slate-200"
    >
      <div className="flex min-h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3">
        <BackLink to="/admin/inbox" label="Inbox" iconOnly />
        <div className="min-w-0 flex-1">
          <h1 id="staff-thread-heading" className="truncate text-base font-semibold text-slate-900">
            {ticket?.subject ?? "Ticket"}
          </h1>
          {ticket && <p className="truncate text-xs text-slate-500">{ticket.memberName}</p>}
        </div>
        {ticket && <StatusBadge status={ticket.status} />}
      </div>
      {content}
    </section>
  );
}

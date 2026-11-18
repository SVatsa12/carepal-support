import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, SearchX } from "lucide-react";
import BackLink from "../../components/BackLink";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Skeleton from "../../components/Skeleton";
import Conversation from "../../components/chat/Conversation";
import StatusBadge from "../../components/tickets/StatusBadge";
import WaitTimer from "../../components/WaitTimer";
import { useAuth } from "../../hooks/useAuth";
import { useMarkRead } from "../../hooks/useMarkRead";
import { useTicket } from "../../hooks/useTicket";
import { TYPICAL_REPLY_MINUTES } from "../../constants";

const NEW_TICKET_LINK =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700";

function ResolvedNotice() {
  return (
    <div className="border-t border-slate-200 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center">
        <p className="flex flex-1 items-center gap-2 text-sm text-emerald-900">
          <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
          This ticket is resolved. Need more help? Raise a new ticket.
        </p>
        <Link to="/app/tickets/new" className={NEW_TICKET_LINK}>
          Raise a new ticket
        </Link>
      </div>
    </div>
  );
}

function CenteredState({ children }) {
  return <div className="mx-auto w-full max-w-md p-4">{children}</div>;
}

/** Full-height chat page for one of the member's tickets. */
export default function TicketChat() {
  const { ticketId } = useParams();
  const { firebaseUser, profile } = useAuth();
  const { ticket, loading, notFound, error, retry } = useTicket(ticketId);
  const viewer = useMemo(
    () => ({ uid: firebaseUser?.uid, name: profile?.name ?? "", role: "member" }),
    [firebaseUser?.uid, profile?.name],
  );

  useMarkRead({ ticketId: ticket?.id, side: "member", unreadCount: ticket?.unreadMember ?? 0 });

  let content;
  if (loading) {
    content = (
      <CenteredState>
        <div aria-busy="true" aria-label="Loading ticket" className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
        </div>
      </CenteredState>
    );
  } else if (notFound) {
    content = (
      <CenteredState>
        <EmptyState
          icon={SearchX}
          title="Ticket not found"
          message="This ticket doesn't exist or isn't on your account."
          action={
            <Link to="/app/tickets" className={NEW_TICKET_LINK}>
              Back to my tickets
            </Link>
          }
        />
      </CenteredState>
    );
  } else if (error) {
    content = (
      <CenteredState>
        <ErrorState title="We couldn't load this ticket" onRetry={retry} />
      </CenteredState>
    );
  } else {
    content = (
      <Conversation
        ticket={ticket}
        viewer={viewer}
        emptyText={`No replies yet. Our team usually replies within ${TYPICAL_REPLY_MINUTES} minutes.`}
        closedNotice={ticket.status === "resolved" ? <ResolvedNotice /> : null}
      />
    );
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col bg-slate-50 sm:border-x sm:border-slate-200">
      <header className="flex min-h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 pt-[env(safe-area-inset-top)]">
        <BackLink to="/app/tickets" label="My tickets" iconOnly />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-slate-900">
            {ticket?.subject ?? "Ticket"}
          </h1>
          {ticket && <WaitTimer ticket={ticket} variant="member" />}
        </div>
        {ticket && <StatusBadge status={ticket.status} />}
      </header>
      {content}
    </div>
  );
}

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, SearchX } from "lucide-react";
import BackLink from "../BackLink";
import EmptyState from "../EmptyState";
import ErrorState from "../ErrorState";
import Skeleton from "../Skeleton";
import WaitTimer from "../WaitTimer";
import Conversation from "../chat/Conversation";
import RatingCard from "./RatingCard";
import StatusBadge from "../tickets/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { useMarkRead } from "../../hooks/useMarkRead";
import { useTicket } from "../../hooks/useTicket";
import { TYPICAL_REPLY_MINUTES } from "../../constants";

const PRIMARY_LINK =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800";

/** Replaces the composer on a resolved ticket: the rating card plus a way to get more help. */
function ResolvedNotice({ ticket }) {
  return (
    <div className="max-h-[65dvh] space-y-3 overflow-y-auto border-t border-slate-200 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
      <RatingCard ticket={ticket} />
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center">
        <p className="flex flex-1 items-center gap-2 text-sm text-emerald-900">
          <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
          This ticket is resolved. Need more help? Raise a new ticket.
        </p>
        <Link to="/app/tickets/new" className={PRIMARY_LINK}>
          Raise a new ticket
        </Link>
      </div>
    </div>
  );
}

function CenteredState({ children }) {
  return <div className="mx-auto w-full max-w-md p-4">{children}</div>;
}

/**
 * One of the member's tickets: header, live thread and composer (or the resolved notice).
 * Full screen on phones and tablets; the right-hand pane beside the list from lg up, where
 * the back link is hidden and, from xl, the ticket details move to a sidebar.
 */
export default function TicketChatPanel({ ticketId, backTo }) {
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
            <Link to="/app/tickets" className={PRIMARY_LINK}>
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
        summarySidebar
        emptyText={`No replies yet. Our team usually replies within ${TYPICAL_REPLY_MINUTES} minutes.`}
        closedNotice={ticket.status === "resolved" ? <ResolvedNotice ticket={ticket} /> : null}
      />
    );
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col bg-slate-50 sm:border-x sm:border-slate-200 lg:mx-0 lg:h-auto lg:min-h-0 lg:max-w-none lg:flex-1 lg:border-x-0">
      <header className="flex min-h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 pt-[env(safe-area-inset-top)] lg:px-4 lg:pt-0">
        <div className="lg:hidden">
          <BackLink to={backTo} label="My tickets" iconOnly />
        </div>
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

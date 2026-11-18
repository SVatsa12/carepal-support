import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SearchX, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";
import QuickReplyPicker from "./QuickReplyPicker";
import TicketControls from "./TicketControls";
import BackLink from "../BackLink";
import EmptyState from "../EmptyState";
import ErrorState from "../ErrorState";
import Skeleton from "../Skeleton";
import Conversation from "../chat/Conversation";
import StatusBadge from "../tickets/StatusBadge";
import WaitTimer from "../WaitTimer";
import { useAuth } from "../../hooks/useAuth";
import { useMarkRead } from "../../hooks/useMarkRead";
import { useMemberProfile } from "../../hooks/useMemberProfile";
import { useNow } from "../../hooks/useNow";
import { useTicket } from "../../hooks/useTicket";
import { formatRelative } from "../../utils/time";

function DetailHeader({ ticket, backTo, actor }) {
  const now = useNow();
  const member = useMemberProfile(ticket.memberId);
  const memberDetails = [ticket.memberName, member?.city, member?.careType].filter(Boolean);
  // Phones get the controls behind a toggle so the conversation keeps most of the screen.
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 sm:px-4 sm:pb-3">
      <div className="flex items-start gap-2">
        <div className="lg:hidden">
          <BackLink to={backTo} label="Back to inbox" iconOnly />
        </div>
        <div className="min-w-0 flex-1 py-1">
          <h1
            id="ticket-detail-heading"
            className="truncate text-base font-semibold text-slate-900"
          >
            {ticket.subject}
          </h1>
          <div className="flex min-w-0 items-center gap-2">
            <WaitTimer ticket={ticket} className="shrink-0" />
            <p className="truncate text-xs text-slate-500">
              {ticket.ticketNo} · {memberDetails.join(" · ")} · created{" "}
              {formatRelative(ticket.createdAt, now)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:hidden">
          <StatusBadge status={ticket.status} />
          <button
            type="button"
            onClick={() => setManageOpen((value) => !value)}
            aria-expanded={manageOpen}
            aria-controls="ticket-controls"
            aria-label="Manage status, priority and assignee"
            className={clsx(
              "flex h-11 w-11 items-center justify-center rounded-lg",
              manageOpen ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div id="ticket-controls" className={clsx(!manageOpen && "hidden sm:block")}>
        <TicketControls ticket={ticket} actor={actor} />
      </div>
    </div>
  );
}

/** Staff view of one ticket: header with controls, then the shared conversation. */
export default function TicketDetail({ ticketId, backTo }) {
  const { firebaseUser, profile } = useAuth();
  const { ticket, loading, notFound, error, retry } = useTicket(ticketId);
  const viewer = useMemo(
    () => ({ uid: firebaseUser?.uid, name: profile?.name ?? "", role: "staff" }),
    [firebaseUser?.uid, profile?.name],
  );

  useMarkRead({ ticketId: ticket?.id, side: "staff", unreadCount: ticket?.unreadStaff ?? 0 });

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading ticket" className="w-full space-y-3 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-12 w-1/2 rounded-2xl" />
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="w-full p-4">
        <EmptyState
          icon={SearchX}
          title="Ticket not found"
          message="It may have been removed, or the link is wrong."
          action={
            <Link
              to={backTo}
              className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Back to inbox
            </Link>
          }
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full p-4">
        <ErrorState title="We couldn't load this ticket" onRetry={retry} />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="ticket-detail-heading"
      className="flex min-h-0 w-full flex-col bg-slate-50"
    >
      <DetailHeader ticket={ticket} backTo={backTo} actor={viewer} />
      <Conversation
        ticket={ticket}
        viewer={viewer}
        Toolbar={QuickReplyPicker}
        emptyText={
          ticket.status === "pending"
            ? "No replies yet. Your reply moves the ticket to In progress."
            : "No replies yet."
        }
      />
    </section>
  );
}

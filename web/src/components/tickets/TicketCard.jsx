import { Link } from "react-router-dom";
import CategoryIcon from "./CategoryIcon";
import MemberWaitLine from "./MemberWaitLine";
import PriorityPill from "./PriorityPill";
import StatusBadge from "./StatusBadge";
import UnreadBadge from "../UnreadBadge";
import Skeleton from "../Skeleton";
import { useNow } from "../../hooks/useNow";
import { formatRelative, toDate } from "../../utils/time";

/** One ticket in the member's list; the whole card links to the chat. */
export default function TicketCard({ ticket }) {
  const now = useNow();
  const hasUnread = ticket.unreadMember > 0;
  const speaker = ticket.lastMessageRole === "member" ? "You" : "CarePal";

  return (
    <Link
      to={`/app/tickets/${ticket.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow"
    >
      <div className="flex gap-3">
        <CategoryIcon category={ticket.category} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2
              className={
                hasUnread
                  ? "line-clamp-2 text-sm font-semibold text-slate-900"
                  : "line-clamp-2 text-sm font-medium text-slate-900"
              }
            >
              {ticket.subject}
            </h2>
            <UnreadBadge count={ticket.unreadMember} className="mt-0.5 shrink-0" />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">{ticket.ticketNo}</span>
            <StatusBadge status={ticket.status} />
            <PriorityPill priority={ticket.priority} />
          </div>

          <p className="mt-2 line-clamp-2 break-words text-sm text-slate-600">
            <span className="font-medium text-slate-700">{speaker}: </span>
            {ticket.lastMessagePreview}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <MemberWaitLine ticket={ticket} />
            <time
              dateTime={toDate(ticket.lastMessageAt)?.toISOString()}
              className="ml-auto text-xs text-slate-500"
            >
              {formatRelative(ticket.lastMessageAt, now)}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TicketCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

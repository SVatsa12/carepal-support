import { Link } from "react-router-dom";
import clsx from "clsx";
import AssigneeAvatar from "./AssigneeAvatar";
import CategoryIcon from "../tickets/CategoryIcon";
import PriorityPill from "../tickets/PriorityPill";
import StatusBadge from "../tickets/StatusBadge";
import UnreadBadge from "../UnreadBadge";
import Skeleton from "../Skeleton";
import { formatRelative } from "../../utils/time";

/** One ticket in the staff inbox. `search` keeps the current filters in the link. */
export default function InboxRow({ ticket, selected, search, showStatus, now }) {
  const unread = ticket.unreadStaff > 0;

  return (
    <Link
      to={`/admin/inbox/${ticket.id}${search}`}
      aria-current={selected ? "page" : undefined}
      className={clsx(
        "block border-b border-slate-100 px-4 py-3 transition",
        selected
          ? "bg-brand-50 shadow-[inset_3px_0_0_theme(colors.brand.600)]"
          : "hover:bg-slate-50",
      )}
    >
      <div className="flex gap-3">
        <CategoryIcon category={ticket.category} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={clsx(
                "truncate text-sm",
                unread ? "font-semibold text-slate-900" : "font-medium text-slate-700",
              )}
            >
              {ticket.memberName}
            </p>
            <span className="shrink-0 text-xs text-slate-500">
              {formatRelative(ticket.lastMessageAt, now)}
            </span>
          </div>
          <p
            className={clsx(
              "truncate text-sm",
              unread ? "font-semibold text-slate-900" : "text-slate-600",
            )}
          >
            {ticket.subject}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500">{ticket.ticketNo}</span>
            <PriorityPill priority={ticket.priority} />
            {showStatus && <StatusBadge status={ticket.status} />}
            <AssigneeAvatar name={ticket.assigneeName} />
            <UnreadBadge count={ticket.unreadStaff} className="ml-auto" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function InboxRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-slate-100 px-4 py-3">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

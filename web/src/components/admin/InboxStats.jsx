import clsx from "clsx";
import { useNow } from "../../hooks/useNow";
import { SLA_LEVELS } from "../../constants";
import { computeInboxStats } from "../../utils/inboxStats";
import { formatWait, formatWaitLong, slaLevel } from "../../utils/time";

function Stat({ label, children, srText, className }) {
  return (
    <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">
        <span aria-hidden={srText ? "true" : undefined} className={className}>
          {children}
        </span>
        {srText && <span className="sr-only">{srText}</span>}
      </dd>
    </div>
  );
}

/** One scrollable row of headline numbers for the loaded tickets. */
export default function InboxStats({ tickets }) {
  const now = useNow();
  const stats = computeInboxStats(tickets, now);
  const level = stats.longestWaitMs === null ? null : SLA_LEVELS[slaLevel(stats.longestWaitMs)];

  return (
    <dl
      aria-label="Inbox summary"
      className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 py-2"
    >
      <Stat label="Open tickets">{stats.open}</Stat>
      <Stat label="Waiting on us">{stats.waitingOnUs}</Stat>
      <Stat
        label="Longest wait"
        className={clsx(level && "rounded px-1.5 ring-1 ring-inset", level?.classes)}
        srText={level ? `${formatWaitLong(stats.longestWaitMs)}, ${level.label}` : "Nobody waiting"}
      >
        {level ? formatWait(stats.longestWaitMs) : "—"}
      </Stat>
      <Stat
        label="CSAT"
        srText={
          stats.csat
            ? `${stats.csat.average.toFixed(1)} out of 5 from ${stats.csat.count} ratings`
            : "No ratings yet"
        }
      >
        {stats.csat ? `${stats.csat.average.toFixed(1)} / 5 (${stats.csat.count})` : "—"}
      </Stat>
    </dl>
  );
}

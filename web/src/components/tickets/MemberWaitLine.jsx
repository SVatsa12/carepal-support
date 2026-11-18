import { Hourglass } from "lucide-react";
import { useNow } from "../../hooks/useNow";
import { formatWait, toDate } from "../../utils/time";

/** Neutral "Waiting for our team · 12m" line for members; renders nothing unless staff owe a reply. */
export default function MemberWaitLine({ ticket }) {
  const now = useNow();
  if (ticket.awaitingReplyFrom !== "staff") return null;
  const since = toDate(ticket.waitingSince);
  if (!since) return null;

  return (
    <p className="flex items-center gap-1.5 text-xs text-slate-500">
      <Hourglass aria-hidden="true" className="h-3.5 w-3.5" />
      Waiting for our team · {formatWait(now - since.getTime())}
    </p>
  );
}

import { Hourglass, MessageCircleReply, Timer } from "lucide-react";
import clsx from "clsx";
import { useNow } from "../hooks/useNow";
import { SLA_LEVELS } from "../constants";
import { formatWait, formatWaitLong, msSince, slaLevel } from "../utils/time";

const SIZES = {
  sm: { text: "text-xs", icon: "h-3.5 w-3.5", chip: "px-1.5 py-0.5" },
  md: { text: "text-sm", icon: "h-4 w-4", chip: "px-2 py-1" },
};

/**
 * How long a ticket has waited since the last reply, ticking with the shared clock.
 *
 * staff:  awaiting staff  → SLA-coloured chip "1h 12m" (+ "Waiting 1 hour 12 minutes, SLA breached")
 *         awaiting member → neutral "Awaiting member · 3h"
 * member: awaiting staff  → neutral "Waiting for our team · 12m"
 *         awaiting member → "CarePal replied 5m ago"
 * Resolved tickets (awaitingReplyFrom null) render nothing.
 */
export default function WaitTimer({ ticket, variant = "staff", size = "sm", className }) {
  const now = useNow();
  const styles = SIZES[size] ?? SIZES.sm;
  const awaiting = ticket.awaitingReplyFrom;
  if (awaiting !== "staff" && awaiting !== "member") return null;

  const waited = msSince(ticket.waitingSince, now);

  if (variant === "staff" && awaiting === "staff") {
    const level = SLA_LEVELS[slaLevel(waited)];
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-md font-medium ring-1 ring-inset",
          styles.text,
          styles.chip,
          level.classes,
          className,
        )}
        title={`Waiting ${formatWaitLong(waited)}, ${level.label}`}
      >
        <Timer aria-hidden="true" className={styles.icon} />
        <span aria-hidden="true">{formatWait(waited)}</span>
        <span className="sr-only">
          Waiting {formatWaitLong(waited)}, {level.label}
        </span>
      </span>
    );
  }

  let Icon = Hourglass;
  let text;
  if (variant === "staff") {
    text = `Awaiting member · ${formatWait(waited)}`;
  } else if (awaiting === "staff") {
    text = `Waiting for our team · ${formatWait(waited)}`;
  } else {
    Icon = MessageCircleReply;
    text = `CarePal replied ${formatWait(msSince(ticket.lastMessageAt, now))} ago`;
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap text-slate-500",
        styles.text,
        className,
      )}
    >
      <Icon aria-hidden="true" className={styles.icon} />
      {text}
    </span>
  );
}

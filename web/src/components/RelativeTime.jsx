import { useNow } from "../hooks/useNow";
import { formatRelative, toDate } from "../utils/time";

/**
 * "5 min ago" / "Yesterday 3:10 PM" that updates with the shared clock. Only this small
 * element re-renders on each tick, not the list row or page around it.
 */
export default function RelativeTime({ value, prefix = "", className }) {
  const now = useNow();
  const date = toDate(value);
  if (!date) return null;
  return (
    <time dateTime={date.toISOString()} className={className}>
      {prefix}
      {formatRelative(date, now)}
    </time>
  );
}

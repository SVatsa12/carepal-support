import clsx from "clsx";

/** Red count bubble; hidden at 0, capped at "9+". Screen readers hear "3 unread messages". */
export default function UnreadBadge({ count, className }) {
  if (!count || count < 1) return null;
  const label = `${count} unread ${count === 1 ? "message" : "messages"}`;
  return (
    <span
      className={clsx(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white",
        className,
      )}
      title={label}
    >
      <span aria-hidden="true">{count > 9 ? "9+" : count}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

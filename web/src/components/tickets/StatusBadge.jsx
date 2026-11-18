import clsx from "clsx";
import { STATUSES } from "../../constants";

export default function StatusBadge({ status, className }) {
  const meta = STATUSES.find((item) => item.value === status);
  if (!meta) return null;
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        meta.classes,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

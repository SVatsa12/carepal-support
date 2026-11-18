import clsx from "clsx";
import { PRIORITIES } from "../../constants";

export default function PriorityPill({ priority, className }) {
  const meta = PRIORITIES.find((item) => item.value === priority);
  if (!meta) return null;
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        meta.classes,
        className,
      )}
    >
      <span className="sr-only">Priority: </span>
      {meta.label}
    </span>
  );
}

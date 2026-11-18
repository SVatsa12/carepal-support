import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

/** Back navigation link. `iconOnly` keeps the label for screen readers and shows just the arrow. */
export default function BackLink({ to, label, iconOnly = false }) {
  return (
    <Link
      to={to}
      aria-label={iconOnly ? label : undefined}
      className={clsx(
        "inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900",
        iconOnly ? "w-11 shrink-0 justify-center hover:bg-slate-100" : "-ml-2 px-2",
      )}
    >
      <ArrowLeft aria-hidden="true" className={iconOnly ? "h-5 w-5" : "h-4 w-4"} />
      {!iconOnly && label}
    </Link>
  );
}

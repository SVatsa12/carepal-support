import { HeartHandshake } from "lucide-react";
import clsx from "clsx";
import { APP_NAME } from "../constants";

/** Brand mark + app name. `compact` hides the name below the sm breakpoint. */
export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
        <HeartHandshake aria-hidden="true" className="h-5 w-5" />
      </span>
      <span
        className={clsx(
          "whitespace-nowrap font-semibold text-slate-900",
          compact && "sr-only sm:not-sr-only",
        )}
      >
        {APP_NAME}
      </span>
    </span>
  );
}

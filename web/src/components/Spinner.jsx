import { Loader2 } from "lucide-react";
import clsx from "clsx";

export function Spinner({ label = "Loading", className }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2
        aria-hidden="true"
        className={clsx("h-6 w-6 animate-spin text-brand-600", className)}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function FullPageSpinner({ label }) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner label={label} className="h-8 w-8" />
    </div>
  );
}

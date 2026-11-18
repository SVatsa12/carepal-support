import { AlertTriangle, RotateCw } from "lucide-react";

/** Inline error panel with an optional retry action. */
export default function ErrorState({
  title = "Something went wrong",
  message = "Please check your connection and try again.",
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center"
    >
      <AlertTriangle aria-hidden="true" className="mb-2 h-6 w-6 text-red-700" />
      <h2 className="text-base font-semibold text-red-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-sm font-medium text-red-800 hover:bg-red-100"
        >
          <RotateCw aria-hidden="true" className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}

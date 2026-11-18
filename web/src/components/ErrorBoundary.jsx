import { Component } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Last line of defence for render errors: logs the error and shows a friendly page with a
 * Reload button instead of a blank screen. (Async errors are handled where they happen.)
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("Unexpected error while rendering", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-8">
        <div
          role="alert"
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        >
          <TriangleAlert aria-hidden="true" className="mx-auto h-8 w-8 text-amber-600" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">Something went wrong</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sorry, this page hit an unexpected problem. Reloading usually fixes it. Your tickets and
            messages are safe.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Reload
          </button>
        </div>
      </main>
    );
  }
}

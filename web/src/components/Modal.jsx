import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { trapTabKey } from "../utils/focusTrap";

/**
 * Accessible dialog: bottom sheet on phones, centred card from sm up. Escape, the close button
 * and a backdrop click call `onClose`; Tab stays inside the dialog; focus moves in on open and
 * returns afterwards. `initialFocusRef` picks the element focused on open (defaults to the
 * close button).
 */
export default function Modal({ title, onClose, children, footer, initialFocusRef }) {
  const titleId = useId();
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    (initialFocusRef?.current ?? closeRef.current)?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      else trapTabKey(event, dialogRef.current);
    };
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose, initialFocusRef]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
          <h2 id={titleId} className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

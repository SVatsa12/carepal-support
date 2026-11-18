import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import clsx from "clsx";
import { MESSAGE_MAX } from "../../constants";

const MAX_LINES = 5;
const COUNTER_FROM = MESSAGE_MAX - 200;

/**
 * Message box with an auto-growing textarea (up to 5 lines). Enter sends, Shift+Enter adds a
 * new line. The textarea stays enabled while sending so the mobile keyboard doesn't close.
 *
 * `onSend(text)` resolves true on success; on failure the text is put back.
 * `onSlash(query)`: optional. Typing "/" into an empty box calls it (with any text after the
 * slash) instead of inserting the slash; the staff composer uses it to open quick replies.
 * Ref API: `insertText(text)` appends text, focuses and puts the cursor at the end.
 */
const Composer = forwardRef(function Composer(
  { onSend, sending, toolbar, onSlash, placeholder = "Type a message" },
  ref,
) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    const styles = getComputedStyle(element);
    const lineHeight = parseFloat(styles.lineHeight) || 24;
    const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const border = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    // border-box sizing: height includes padding and border; scrollHeight includes padding only.
    element.style.height = "auto";
    element.style.height = `${Math.min(
      element.scrollHeight + border,
      lineHeight * MAX_LINES + padding + border,
    )}px`;
  }, [value]);

  useImperativeHandle(ref, () => ({
    insertText(text) {
      setValue((current) => (current.trim() ? `${current.replace(/\s+$/, "")}\n${text}` : text));
      requestAnimationFrame(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.focus();
        element.setSelectionRange(element.value.length, element.value.length);
      });
    },
    focus() {
      textareaRef.current?.focus();
    },
  }));

  const trimmed = value.trim();
  const tooLong = trimmed.length > MESSAGE_MAX;
  const canSend = Boolean(trimmed) && !tooLong && !sending;

  async function submit() {
    if (!canSend) return;
    const text = value;
    setValue("");
    const ok = await onSend(text);
    if (!ok) setValue((current) => current || text);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="border-t border-slate-200 bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-4"
    >
      {toolbar && <div className="mb-2 flex items-center gap-2">{toolbar}</div>}
      <div className="flex items-end gap-2">
        <label htmlFor="composer-input" className="sr-only">
          Message
        </label>
        <textarea
          id="composer-input"
          ref={textareaRef}
          rows={1}
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            const next = event.target.value;
            if (onSlash && value === "" && next.startsWith("/")) {
              onSlash(next.slice(1));
              return;
            }
            setValue(next);
          }}
          onKeyDown={handleKeyDown}
          aria-describedby={trimmed.length >= COUNTER_FROM ? "composer-count" : undefined}
          className="block min-h-11 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base leading-6 text-slate-900 focus:border-brand-600 sm:text-sm"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label={sending ? "Sending message" : "Send message"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizontal aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>
      {trimmed.length >= COUNTER_FROM && (
        <p
          id="composer-count"
          className={clsx("mt-1 text-right text-xs", tooLong ? "text-red-700" : "text-slate-500")}
        >
          {trimmed.length}/{MESSAGE_MAX}
        </p>
      )}
    </form>
  );
});

export default Composer;

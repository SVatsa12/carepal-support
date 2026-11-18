import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Zap } from "lucide-react";
import clsx from "clsx";
import ErrorState from "../ErrorState";
import { useQuickReplies } from "../../hooks/useQuickReplies";
import { fillTemplate, firstName } from "../../utils/text";
import { quickReplyCategoryLabel, rankQuickReplies } from "../../utils/quickReplies";
import { trapTabKey } from "../../utils/focusTrap";

/**
 * Quick replies for the staff composer toolbar: a popover (bottom sheet on phones) with search
 * and keyboard navigation. Opens from the button or when "/" is typed into the empty composer
 * (`openRequest`). Choosing a reply fills its placeholders and inserts it into the composer
 * for editing; it is never sent automatically.
 */
export default function QuickReplyPicker({
  ticket,
  viewer,
  insertText,
  focusComposer,
  openRequest,
}) {
  const { replies, loading, error, retry } = useQuickReplies();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [handledRequestId, setHandledRequestId] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const panelRef = useRef(null);

  // "/" in the composer: open with whatever followed the slash as the search.
  if (openRequest && openRequest.id !== handledRequestId) {
    setHandledRequestId(openRequest.id);
    setOpen(true);
    setSearch(openRequest.query);
    setActive(0);
  }

  const results = useMemo(
    () => rankQuickReplies(replies, ticket.category, search),
    [replies, ticket.category, search],
  );
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeReply = results[activeIndex];
  const vars = {
    memberName: firstName(ticket.memberName),
    ticketNo: ticket.ticketNo,
    agentName: firstName(viewer.name),
  };

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const closeOnOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !activeReply) return;
    listRef.current
      ?.querySelector(`[data-reply-id="${activeReply.id}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeReply]);

  function reset() {
    setOpen(false);
    setSearch("");
    setActive(0);
  }

  function close() {
    reset();
    focusComposer?.();
  }

  function choose(reply) {
    reset();
    insertText(fillTemplate(reply.body, vars));
  }

  // Escape and Tab apply anywhere in the panel; the arrows and Enter only in the search box.
  function handlePanelKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else {
      trapTabKey(event, panelRef.current);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setActive((activeIndex + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActive((activeIndex - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (activeReply) choose(activeReply);
    }
  }

  let body;
  if (loading) {
    body = <p className="px-4 py-6 text-center text-sm text-slate-500">Loading quick replies…</p>;
  } else if (error) {
    body = (
      <div className="p-3">
        <ErrorState title="Couldn't load quick replies" onRetry={retry} />
      </div>
    );
  } else if (results.length === 0) {
    body = (
      <div className="px-4 py-6 text-center text-sm text-slate-500">
        {replies.length === 0 ? (
          <>
            No quick replies yet.{" "}
            <Link to="/admin/quick-replies" className="font-medium text-brand-700 underline">
              Manage quick replies
            </Link>
          </>
        ) : search.trim() ? (
          `No quick replies match "${search.trim()}".`
        ) : (
          "No quick replies for this category yet."
        )}
      </div>
    );
  } else {
    body = (
      <ul
        id="quick-reply-options"
        ref={listRef}
        role="listbox"
        aria-label="Quick replies"
        className="max-h-[50dvh] overflow-y-auto overscroll-contain p-1 sm:max-h-80"
      >
        {results.map((reply, index) => {
          const selected = index === activeIndex;
          return (
            <li
              key={reply.id}
              id={`quick-reply-${reply.id}`}
              data-reply-id={reply.id}
              role="option"
              aria-selected={selected}
              onMouseMove={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(reply)}
              className={clsx(
                "cursor-pointer rounded-lg px-3 py-2",
                selected ? "bg-brand-50 ring-1 ring-inset ring-brand-200" : "hover:bg-slate-50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-900">{reply.title}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {quickReplyCategoryLabel(reply.category)}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-xs text-slate-600">
                {fillTemplate(reply.body, vars)}
              </p>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="quick-reply-panel"
        className={clsx(
          "inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium",
          open
            ? "border-brand-300 bg-brand-50 text-brand-800"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        )}
      >
        <Zap aria-hidden="true" className="h-4 w-4" />
        Quick replies
        <kbd className="hidden rounded border border-slate-300 px-1 text-[10px] text-slate-500 sm:inline">
          /
        </kbd>
      </button>

      {open && (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-30 bg-slate-900/40 sm:hidden" />
          <div
            id="quick-reply-panel"
            ref={panelRef}
            role="dialog"
            aria-label="Quick replies"
            onKeyDown={handlePanelKeyDown}
            className="fixed inset-x-0 bottom-0 z-40 flex max-h-[80dvh] flex-col rounded-t-2xl border border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-xl sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-2 sm:w-[26rem] sm:rounded-xl sm:pb-0"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 p-2">
              <div className="relative flex-1">
                <label htmlFor="quick-reply-search" className="sr-only">
                  Search quick replies
                </label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="quick-reply-search"
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="quick-reply-options"
                  aria-autocomplete="list"
                  aria-activedescendant={activeReply ? `quick-reply-${activeReply.id}` : undefined}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search quick replies"
                  autoComplete="off"
                  className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-base text-slate-900 focus:border-brand-600 sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close quick replies"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            {body}
            <p className="hidden border-t border-slate-100 px-3 py-1.5 text-xs text-slate-500 sm:block">
              ↑ ↓ to choose · Enter to insert · Esc to close
            </p>
          </div>
        </>
      )}
    </div>
  );
}

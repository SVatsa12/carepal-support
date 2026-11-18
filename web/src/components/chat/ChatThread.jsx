import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, MessagesSquare } from "lucide-react";
import MessageBubble from "./MessageBubble";
import SystemMessage from "./SystemMessage";
import ErrorState from "../ErrorState";
import Skeleton from "../Skeleton";
import { useNow } from "../../hooks/useNow";
import { dayKey, dayLabel } from "../../utils/time";

const NEAR_BOTTOM_PX = 120;

function groupByDay(messages) {
  const groups = [];
  for (const message of messages) {
    const key = dayKey(message.createdAt);
    const last = groups.at(-1);
    if (last && last.key === key) last.messages.push(message);
    else groups.push({ key, date: message.createdAt, messages: [message] });
  }
  return groups;
}

function ThreadSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading messages" className="space-y-4 p-4">
      <Skeleton className="h-14 w-2/3 rounded-2xl" />
      <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
      <Skeleton className="h-20 w-3/4 rounded-2xl" />
    </div>
  );
}

/**
 * Scrollable message list grouped by day. Sticks to the bottom on first load and for new
 * messages while the reader is near the bottom (or when they sent it); otherwise shows a
 * "New messages" pill.
 *
 * `viewerSide` is "member" or "staff": that side's messages render on the right.
 * `header` scrolls with the messages (the ticket summary goes there).
 * Render with key={ticketId} so switching tickets starts at the bottom again.
 */
export default function ChatThread({
  messages,
  viewerSide,
  viewerId,
  loading,
  error,
  onRetry,
  emptyText,
  header,
}) {
  const now = useNow();
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const initialScrollDone = useRef(false);
  const [nearBottom, setNearBottom] = useState(true);
  const [seenId, setSeenId] = useState(null);

  const last = messages.at(-1);
  const lastId = last?.id ?? null;
  const lastIsOwn = Boolean(last) && last.senderId === viewerId;

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element || !lastId) return;
    if (!initialScrollDone.current) {
      element.scrollTop = element.scrollHeight;
      initialScrollDone.current = true;
      return;
    }
    if (nearBottomRef.current || lastIsOwn) {
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    }
  }, [lastId, lastIsOwn]);

  function handleScroll() {
    const element = scrollRef.current;
    const isNear = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
    nearBottomRef.current = isNear;
    setNearBottom(isNear);
    if (isNear) setSeenId(lastId);
  }

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }

  // With a short thread nothing scrolls, so treat "at the bottom" as having seen everything.
  const showNewPill = !nearBottom && lastId !== null && lastId !== seenId;
  // Screen readers hear the latest message from the other side, not the whole history.
  const announcement =
    last && last.type === "message" && last.senderRole !== viewerSide
      ? `New message from ${last.senderName}: ${last.text}`
      : "";

  let body;
  if (loading) body = <ThreadSkeleton />;
  else if (error) {
    body = (
      <div className="p-4">
        <ErrorState
          title="We couldn't load the conversation"
          message="Please check your connection and try again."
          onRetry={onRetry}
        />
      </div>
    );
  } else if (messages.length === 0) {
    body = (
      <div className="flex flex-col items-center px-6 py-10 text-center text-sm text-slate-500">
        <MessagesSquare aria-hidden="true" className="mb-2 h-6 w-6 text-slate-400" />
        {emptyText}
      </div>
    );
  } else {
    body = (
      <ol className="space-y-3 px-3 py-4 sm:px-4" aria-label="Messages">
        {groupByDay(messages).map((group) => (
          <li key={group.key} className="space-y-3">
            <div className="flex items-center gap-3 py-1" role="separator">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-500">
                {dayLabel(group.date, now)}
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <ol className="space-y-2">
              {group.messages.map((message, index) => {
                if (message.type === "system") {
                  return (
                    <li key={message.id}>
                      <SystemMessage message={message} />
                    </li>
                  );
                }
                const own = message.senderRole === viewerSide;
                const previous = group.messages[index - 1];
                const sameSenderAsPrevious =
                  previous?.type === "message" && previous.senderId === message.senderId;
                const showSender = !sameSenderAsPrevious && (!own || message.senderId !== viewerId);
                return (
                  <li key={message.id}>
                    <MessageBubble message={message} own={own} showSender={showSender} />
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {header}
        {body}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {showNewPill && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900 px-4 text-sm font-medium text-white shadow-lg hover:bg-slate-800"
        >
          New messages
          <ArrowDown aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

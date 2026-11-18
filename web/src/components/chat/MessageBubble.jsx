import { memo } from "react";
import { Clock } from "lucide-react";
import clsx from "clsx";
import { formatClock, toDate } from "../../utils/time";
import { firstName } from "../../utils/text";

function senderLabel(message) {
  if (message.senderRole === "staff") return `${firstName(message.senderName)} · CarePal team`;
  return message.senderName;
}

/**
 * One chat message. `own` puts it on the right in the brand colour.
 * `showSender` adds the name line (used for the other side, and for colleagues on staff view).
 */
const MessageBubble = memo(function MessageBubble({ message, own, showSender }) {
  const date = toDate(message.createdAt);

  return (
    <div className={clsx("flex", own ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm sm:max-w-[75%] lg:max-w-[70%]",
          own
            ? "rounded-br-md bg-brand-700 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-900",
        )}
      >
        {showSender && (
          <p
            className={clsx(
              "mb-0.5 text-xs font-semibold",
              own ? "text-brand-100" : "text-brand-700",
            )}
          >
            {senderLabel(message)}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">
          {message.text}
        </p>
        <p
          className={clsx(
            "mt-1 flex items-center justify-end gap-1 text-[11px]",
            own ? "text-brand-100" : "text-slate-500",
          )}
        >
          {message.pending && (
            <>
              <Clock aria-hidden="true" className="h-3 w-3" />
              <span className="sr-only">Sending,</span>
            </>
          )}
          <time dateTime={date?.toISOString()}>{formatClock(date)}</time>
        </p>
      </div>
    </div>
  );
});

export default MessageBubble;

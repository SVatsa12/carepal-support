import { useCallback, useMemo, useRef } from "react";
import ChatThread from "./ChatThread";
import Composer from "./Composer";
import TicketSummary from "./TicketSummary";
import { useMessages } from "../../hooks/useMessages";
import { useSendMessage } from "../../hooks/useSendMessage";

/**
 * Thread + composer for one ticket, shared by the member chat and the staff inbox.
 *
 * - `viewer`: { uid, name, role: "member" | "staff" }
 * - `closedNotice`: rendered instead of the composer when replies are closed.
 * - `Toolbar`: optional component rendered above the composer as <Toolbar insertText={fn} />
 *   (quick replies use it to drop text into the message box).
 */
export default function Conversation({
  ticket,
  viewer,
  closedNotice,
  Toolbar,
  emptyText,
  summaryDefaultOpen,
}) {
  const { messages, loading, error, retry } = useMessages(ticket.id);
  const confirmedIds = useMemo(() => new Set(messages.map((message) => message.id)), [messages]);
  const { send, pendingMessages, sending } = useSendMessage(ticket.id, viewer, confirmedIds);
  const composerRef = useRef(null);
  const insertText = useCallback((text) => composerRef.current?.insertText(text), []);

  const shown = pendingMessages.length ? [...messages, ...pendingMessages] : messages;

  return (
    <>
      <ChatThread
        key={ticket.id}
        messages={shown}
        viewerSide={viewer.role}
        viewerId={viewer.uid}
        loading={loading}
        error={error}
        onRetry={retry}
        emptyText={emptyText}
        header={<TicketSummary ticket={ticket} defaultOpen={summaryDefaultOpen} />}
      />
      {closedNotice ?? (
        <Composer
          ref={composerRef}
          onSend={send}
          sending={sending}
          toolbar={Toolbar ? <Toolbar insertText={insertText} /> : null}
        />
      )}
    </>
  );
}

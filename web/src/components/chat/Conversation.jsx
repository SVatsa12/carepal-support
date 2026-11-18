import { useCallback, useMemo, useRef, useState } from "react";
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
 * - `Toolbar`: optional component rendered above the composer (the staff quick-reply picker).
 *   It receives { ticket, viewer, insertText, focusComposer, openRequest }; `openRequest`
 *   ({ id, query }) changes whenever "/" is typed into the empty composer.
 * - `summarySidebar`: from xl up, show the ticket details in a right-hand column instead of
 *   the collapsible card above the messages (member chat).
 */
export default function Conversation({
  ticket,
  viewer,
  closedNotice,
  Toolbar,
  emptyText,
  summaryDefaultOpen,
  summarySidebar = false,
}) {
  const { messages, loading, error, retry } = useMessages(ticket.id);
  const confirmedIds = useMemo(() => new Set(messages.map((message) => message.id)), [messages]);
  const { send, pendingMessages, sending } = useSendMessage(ticket.id, viewer, confirmedIds);
  const composerRef = useRef(null);
  const insertText = useCallback((text) => composerRef.current?.insertText(text), []);
  const focusComposer = useCallback(() => composerRef.current?.focus(), []);
  const [openRequest, setOpenRequest] = useState(null);
  const handleSlash = useCallback(
    (query) => setOpenRequest((previous) => ({ id: (previous?.id ?? 0) + 1, query })),
    [],
  );

  const shown = pendingMessages.length ? [...messages, ...pendingMessages] : messages;

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatThread
          key={ticket.id}
          messages={shown}
          viewerSide={viewer.role}
          viewerId={viewer.uid}
          loading={loading}
          error={error}
          onRetry={retry}
          emptyText={emptyText}
          header={
            <div className={summarySidebar ? "xl:hidden" : undefined}>
              <TicketSummary ticket={ticket} defaultOpen={summaryDefaultOpen} />
            </div>
          }
        />
        {closedNotice ?? (
          <Composer
            ref={composerRef}
            onSend={send}
            sending={sending}
            onSlash={Toolbar ? handleSlash : undefined}
            toolbar={
              Toolbar ? (
                <Toolbar
                  ticket={ticket}
                  viewer={viewer}
                  insertText={insertText}
                  focusComposer={focusComposer}
                  openRequest={openRequest}
                />
              ) : null
            }
          />
        )}
      </div>
      {summarySidebar && (
        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white xl:block">
          <TicketSummary ticket={ticket} variant="sidebar" />
        </aside>
      )}
    </div>
  );
}

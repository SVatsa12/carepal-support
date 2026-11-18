import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { sendErrorMessage, sendMessage } from "../services/messages";

let localCounter = 0;

/**
 * Sends messages and keeps an optimistic "sending" bubble for each until the real message
 * arrives from the listener. Transactions have no local latency compensation, so without this
 * the sender would see nothing until the server commits.
 *
 * `confirmedIds` are the ids currently in the live message list.
 */
export function useSendMessage(ticketId, sender, confirmedIds) {
  const [outgoing, setOutgoing] = useState([]);
  const { uid, name, role } = sender;

  const send = useCallback(
    async (text) => {
      localCounter += 1;
      const localId = `local-${localCounter}`;
      setOutgoing((items) => [
        ...items,
        {
          id: localId,
          ticketId,
          type: "message",
          senderId: uid,
          senderName: name,
          senderRole: role,
          text: text.trim(),
          createdAt: new Date(),
          pending: true,
          realId: null,
        },
      ]);
      try {
        const realId = await sendMessage({ ticketId, text, sender: { uid, name, role } });
        setOutgoing((items) =>
          items.map((item) => (item.id === localId ? { ...item, realId } : item)),
        );
        return true;
      } catch (error) {
        console.error("Send message failed", error);
        toast.error(sendErrorMessage(error));
        setOutgoing((items) => items.filter((item) => item.id !== localId));
        return false;
      }
    },
    [ticketId, uid, name, role],
  );

  // Hide a bubble once its real message is in the live list.
  const pendingMessages = outgoing.filter(
    (item) => item.ticketId === ticketId && !(item.realId && confirmedIds.has(item.realId)),
  );

  return {
    send,
    pendingMessages,
    sending: pendingMessages.some((item) => !item.realId),
  };
}

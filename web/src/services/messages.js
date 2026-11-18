import {
  collection,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { MESSAGE_MAX, PREVIEW_MAX } from "../constants";
import { truncate } from "../utils/text";
import { systemMessage } from "./tickets";

/** Send/read failure with a `code` for logic and a `message` that is safe to show the user. */
export class MessageError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "MessageError";
    this.code = code;
  }
}

const UNREAD_FIELD = { member: "unreadMember", staff: "unreadStaff" };

/**
 * Sends a chat message in ONE transaction: read ticket → create message → update ticket.
 * - increments the other side's unread counter;
 * - starts the wait clock only when the other side wasn't already being waited on, so
 *   waitingSince stays at the OLDEST unanswered message;
 * - on a resolved ticket (staff only) the wait fields stay null;
 * - a staff reply on a "pending" ticket also moves it to "in_progress" and adds the system
 *   message "Status changed to In progress", in this same transaction, so the status can
 *   never disagree with the fact that someone has replied.
 * Returns the new message id.
 */
export async function sendMessage({ ticketId, text, sender }) {
  const cleanText = (text ?? "").trim();
  if (!cleanText) throw new MessageError("empty", "Type a message first.");
  if (cleanText.length > MESSAGE_MAX) {
    throw new MessageError("too-long", `Messages can be up to ${MESSAGE_MAX} characters.`);
  }

  const ticketRef = doc(db, "tickets", ticketId);
  const messages = collection(db, "tickets", ticketId, "messages");
  // Both messages get the same server createdAt; Firestore then orders by document id, so the
  // smaller id goes to the system message to show it just above the reply.
  const [systemId, replyId] = [doc(messages).id, doc(messages).id].sort();
  const messageRef = doc(messages, replyId);
  const otherSide = sender.role === "member" ? "staff" : "member";

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ticketRef);
    if (!snapshot.exists()) {
      throw new MessageError("not-found", "This ticket no longer exists.");
    }
    const ticket = snapshot.data();
    const resolved = ticket.status === "resolved";
    if (resolved && sender.role === "member") {
      throw new MessageError(
        "resolved",
        "This ticket is resolved, so replies are closed. Raise a new ticket if you need more help.",
      );
    }

    transaction.set(messageRef, {
      type: "message",
      senderId: sender.uid,
      senderName: sender.name,
      senderRole: sender.role,
      text: cleanText,
      createdAt: serverTimestamp(),
    });

    const update = {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: truncate(cleanText, PREVIEW_MAX),
      lastMessageRole: sender.role,
      updatedAt: serverTimestamp(),
      [UNREAD_FIELD[otherSide]]: increment(1),
    };
    if (!resolved && ticket.awaitingReplyFrom !== otherSide) {
      update.awaitingReplyFrom = otherSide;
      update.waitingSince = serverTimestamp();
    }
    if (sender.role === "staff" && ticket.status === "pending") {
      update.status = "in_progress";
      transaction.set(
        doc(messages, systemId),
        systemMessage(sender, "Status changed to In progress"),
      );
    }
    transaction.update(ticketRef, update);
  });

  return messageRef.id;
}

/** Resets the reader's own unread counter. `side` is "member" or "staff". */
export function markRead({ ticketId, side }) {
  return updateDoc(doc(db, "tickets", ticketId), { [UNREAD_FIELD[side]]: 0 });
}

/** User-facing text for any error thrown by sendMessage. */
export function sendErrorMessage(error) {
  if (error instanceof MessageError) return error.message;
  if (error?.code === "permission-denied") {
    return "You can't reply to this ticket any more. Refresh to see its latest status.";
  }
  return "Message not sent. Check your connection and try again.";
}

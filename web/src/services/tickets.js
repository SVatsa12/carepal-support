import { collection, doc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { PREVIEW_MAX, PRIORITIES, RATING_COMMENT_MAX, STATUSES } from "../constants";
import { firstName, truncate } from "../utils/text";
import { ticketNoFromId } from "../utils/tickets";

/**
 * Creates a ticket for the signed-in member. The description is the member's first message,
 * so the ticket starts waiting on staff with one unread message for them.
 */
export async function createTicket({
  profile,
  category,
  priority,
  subject,
  description,
  photoUrl,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You need to be signed in to raise a ticket.");

  const ref = doc(collection(db, "tickets"));
  const ticketNo = ticketNoFromId(ref.id);
  const cleanDescription = description.trim();
  const now = serverTimestamp();

  await setDoc(ref, {
    ticketNo,
    memberId: user.uid,
    memberName: profile.name,
    memberEmail: user.email,
    category,
    priority,
    subject: subject.trim(),
    description: cleanDescription,
    photoUrl: photoUrl ?? null,
    status: "pending",
    assigneeId: null,
    assigneeName: null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    lastMessageAt: now,
    lastMessagePreview: truncate(cleanDescription, PREVIEW_MAX),
    lastMessageRole: "member",
    awaitingReplyFrom: "staff",
    waitingSince: now,
    unreadMember: 0,
    unreadStaff: 1,
    rating: null,
  });

  return { id: ref.id, ticketNo };
}

// ---------- Staff actions ----------
// Each is ONE transaction: update the ticket and write a "system" message the member also sees.
// System messages never touch unread counters or the wait timer.

const STATUS_LABELS = Object.fromEntries(STATUSES.map((item) => [item.value, item.label]));
const PRIORITY_LABELS = Object.fromEntries(PRIORITIES.map((item) => [item.value, item.label]));

/** A system message in the ticket's thread, written by `actor` ({ uid, name }). */
export function systemMessage(actor, text) {
  return {
    type: "system",
    senderId: actor.uid,
    senderName: actor.name,
    senderRole: "system",
    text,
    createdAt: serverTimestamp(),
  };
}

/**
 * Reads the ticket, lets `buildChange(ticket)` decide the update and system text, then writes
 * both. Returns false (and writes nothing) when `buildChange` returns null: nothing changed.
 */
async function staffTransaction(ticketId, actor, buildChange) {
  const ticketRef = doc(db, "tickets", ticketId);
  const messageRef = doc(collection(db, "tickets", ticketId, "messages"));
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ticketRef);
    if (!snapshot.exists()) throw new Error("This ticket no longer exists.");
    const change = buildChange(snapshot.data());
    if (!change) return false;
    transaction.update(ticketRef, { ...change.update, updatedAt: serverTimestamp() });
    transaction.set(messageRef, systemMessage(actor, change.text));
    return true;
  });
}

/**
 * Status change. Resolving clears the wait clock and stamps resolvedAt; reopening a resolved
 * ticket starts waiting on staff again from now. Pending ↔ in progress touches status only.
 */
export function updateStatus({ ticketId, status, actor }) {
  return staffTransaction(ticketId, actor, (ticket) => {
    if (ticket.status === status) return null;
    const update = { status };
    if (status === "resolved") {
      Object.assign(update, {
        resolvedAt: serverTimestamp(),
        awaitingReplyFrom: null,
        waitingSince: null,
      });
    } else if (ticket.status === "resolved") {
      Object.assign(update, {
        resolvedAt: null,
        awaitingReplyFrom: "staff",
        waitingSince: serverTimestamp(),
      });
    }
    return { update, text: `${firstName(actor.name)} changed status to ${STATUS_LABELS[status]}` };
  });
}

/** Assigns to `assignee` ({ id, name }) or clears the assignment when `assignee` is null. */
export function assignTicket({ ticketId, assignee, actor }) {
  return staffTransaction(ticketId, actor, (ticket) => {
    const nextId = assignee?.id ?? null;
    if ((ticket.assigneeId ?? null) === nextId) return null;
    return {
      update: { assigneeId: nextId, assigneeName: assignee?.name ?? null },
      text: assignee
        ? `Assigned to ${firstName(assignee.name)}`
        : `${firstName(actor.name)} removed the assignment`,
    };
  });
}

export function updatePriority({ ticketId, priority, actor }) {
  return staffTransaction(ticketId, actor, (ticket) => {
    if (ticket.priority === priority) return null;
    return {
      update: { priority },
      text: `${firstName(actor.name)} changed priority to ${PRIORITY_LABELS[priority]}`,
    };
  });
}

// ---------- Member rating ----------

/** Rating failure with a `code` and a message that is safe to show the member. */
export class RatingError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "RatingError";
    this.code = code;
  }
}

/**
 * Member rates a resolved ticket, once. Writes only `rating` and `updatedAt`, the shape the
 * rules allow; the transaction gives a friendly error if it was already rated or reopened.
 */
export async function submitRating({ ticketId, score, comment }) {
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new RatingError("invalid", "Choose between 1 and 5 stars.");
  }
  const cleanComment = (comment ?? "").trim();
  if (cleanComment.length > RATING_COMMENT_MAX) {
    throw new RatingError("invalid", `Comments can be up to ${RATING_COMMENT_MAX} characters.`);
  }

  const ticketRef = doc(db, "tickets", ticketId);
  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ticketRef);
      if (!snapshot.exists()) throw new RatingError("not-found", "This ticket no longer exists.");
      const ticket = snapshot.data();
      if (ticket.rating) {
        throw new RatingError("already-rated", "You've already rated this ticket. Thank you!");
      }
      if (ticket.status !== "resolved") {
        throw new RatingError(
          "not-resolved",
          "This ticket isn't resolved right now, so it can't be rated yet.",
        );
      }
      transaction.update(ticketRef, {
        rating: { score, comment: cleanComment, createdAt: serverTimestamp() },
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    if (error instanceof RatingError) throw error;
    // The rules reject a second rating too (e.g. two tabs submitting at once).
    if (error?.code === "permission-denied") {
      throw new RatingError("already-rated", "This ticket has already been rated. Thank you!");
    }
    throw error;
  }
}

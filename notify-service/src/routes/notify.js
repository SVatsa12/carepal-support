import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import config from "../config.js";
import { db } from "../firebase.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../lib/httpError.js";
import { buildReplyEmail } from "../lib/emailTemplates.js";
import { sendEmail } from "../lib/mailer.js";
import {
  conversationPath,
  isFresh,
  isThrottled,
  otherSide,
  senderSide,
} from "../lib/policy.js";

const router = Router();
const DOC_ID = /^[A-Za-z0-9_-]{1,128}$/;

const toMillis = (timestamp) => timestamp?.toMillis?.() ?? NaN;

function readIds(body) {
  const { ticketId, messageId } = body ?? {};
  if (!DOC_ID.test(ticketId ?? "") || !DOC_ID.test(messageId ?? "")) {
    throw new HttpError(400, "A valid ticketId and messageId are required.");
  }
  return { ticketId, messageId };
}

/** Who gets the email: the member, or the assignee (falling back to the shared inbox). */
async function findRecipient(ticket, recipientSide) {
  if (recipientSide === "member") {
    return { email: ticket.memberEmail, name: ticket.memberName };
  }
  if (ticket.assigneeId) {
    const assignee = await db.doc(`users/${ticket.assigneeId}`).get();
    const email = assignee.get("email");
    if (email) return { email, name: assignee.get("name") ?? ticket.assigneeName };
  }
  return { email: config.supportInboxEmail, name: "" };
}

/**
 * Claims the email slot for that side in a transaction, so two replies sent at once can't
 * both email. Returns the previous lastEmailAt value, or undefined if throttled.
 */
async function claimEmailSlot(ticketRef, recipientSide) {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ticketRef);
    const previous = snapshot.get(`lastEmailAt.${recipientSide}`) ?? null;
    if (isThrottled(toMillis(previous), Date.now(), config.throttleMinutes)) return undefined;
    transaction.update(ticketRef, {
      [`lastEmailAt.${recipientSide}`]: FieldValue.serverTimestamp(),
    });
    return previous;
  });
}

router.post("/notify", requireAuth, async (req, res, next) => {
  try {
    const { ticketId, messageId } = readIds(req.body);
    const ticketRef = db.doc(`tickets/${ticketId}`);
    const [ticketSnap, messageSnap, userSnap] = await Promise.all([
      ticketRef.get(),
      ticketRef.collection("messages").doc(messageId).get(),
      db.doc(`users/${req.uid}`).get(),
    ]);

    if (!ticketSnap.exists) throw new HttpError(404, "Ticket not found.");
    const ticket = ticketSnap.data();
    const side = senderSide(req.uid, userSnap.data(), ticket);
    if (!side) throw new HttpError(403, "You can't notify about this ticket.");

    if (!messageSnap.exists) throw new HttpError(404, "Message not found.");
    const message = messageSnap.data();
    if (message.senderId !== req.uid) {
      throw new HttpError(403, "You can only notify about your own messages.");
    }
    if (message.type !== "message") {
      throw new HttpError(400, "Only chat messages send emails.");
    }
    if (!isFresh(toMillis(message.createdAt), Date.now())) {
      throw new HttpError(400, "That message is too old to notify about.");
    }

    const recipientSide = otherSide(side);
    const recipient = await findRecipient(ticket, recipientSide);
    if (!recipient.email) return res.json({ sent: false, reason: "no-recipient" });

    const email = buildReplyEmail({
      ticketNo: ticket.ticketNo,
      ticketSubject: ticket.subject,
      senderName: side === "staff" ? `${message.senderName} · CarePal team` : message.senderName,
      recipientName: (recipient.name ?? "").trim().split(/\s+/)[0],
      text: message.text,
      link: `${config.appUrl}${conversationPath(recipientSide, ticketId)}`,
    });
    const throttledNow = () =>
      isThrottled(toMillis(ticket.lastEmailAt?.[recipientSide]), Date.now(), config.throttleMinutes);

    if (!config.email.enabled) {
      if (throttledNow()) return res.json({ sent: false, reason: "throttled" });
      await sendEmail({ to: recipient.email, ...email });
      return res.json({ sent: false, reason: "disabled" });
    }

    const previous = await claimEmailSlot(ticketRef, recipientSide);
    if (previous === undefined) return res.json({ sent: false, reason: "throttled" });

    try {
      await sendEmail({ to: recipient.email, ...email });
    } catch (error) {
      // Give the slot back so the next reply can try again.
      await ticketRef.update({ [`lastEmailAt.${recipientSide}`]: previous });
      console.error("SMTP send failed:", error.message);
      throw new HttpError(502, "The email couldn't be sent. Try again later.");
    }
    console.log(`Emailed ${recipientSide} about ${ticket.ticketNo} (message ${messageId}).`);
    return res.json({ sent: true });
  } catch (error) {
    return next(error);
  }
});

export default router;

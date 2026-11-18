/** Pure rules for who may trigger an email, and when. No Firebase or network access here. */

export const STAFF_ROLES = ["agent", "admin"];
export const MAX_MESSAGE_AGE_MS = 2 * 60 * 1000;
// Allow a little clock difference between Firestore's server time and this machine.
const CLOCK_SKEW_MS = 30 * 1000;

/**
 * The side the sender is on ("member" | "staff"), or null if they may not notify about this
 * ticket. Staff may notify on any ticket; a member only on their own.
 */
export function senderSide(uid, user, ticket) {
  if (STAFF_ROLES.includes(user?.role)) return "staff";
  if (user?.role === "member" && ticket.memberId === uid) return "member";
  return null;
}

export function otherSide(side) {
  return side === "member" ? "staff" : "member";
}

/** True when the message was created within the last two minutes. */
export function isFresh(createdAtMs, nowMs) {
  if (!Number.isFinite(createdAtMs)) return false;
  const age = nowMs - createdAtMs;
  return age <= MAX_MESSAGE_AGE_MS && age >= -CLOCK_SKEW_MS;
}

/** True when the last email to that side went out less than `minutes` ago. */
export function isThrottled(lastSentMs, nowMs, minutes) {
  if (!Number.isFinite(lastSentMs)) return false;
  return nowMs - lastSentMs < minutes * 60 * 1000;
}

/** In-app path of the conversation for the recipient's side. */
export function conversationPath(recipientSide, ticketId) {
  const base = recipientSide === "member" ? "/app/tickets" : "/admin/inbox";
  return `${base}/${encodeURIComponent(ticketId)}`;
}

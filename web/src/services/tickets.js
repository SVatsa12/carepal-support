import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { PREVIEW_MAX } from "../constants";
import { truncate } from "../utils/text";
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

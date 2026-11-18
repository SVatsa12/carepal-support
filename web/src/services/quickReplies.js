import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { cleanQuickReply, validateQuickReply } from "../utils/quickReplies";

const quickRepliesRef = collection(db, "quickReplies");

/** All quick replies, A–Z by title. hooks/useQuickReplies listens to this live. */
export function quickRepliesQuery() {
  return query(quickRepliesRef, orderBy("title"));
}

function checked(input) {
  const errors = validateQuickReply(input);
  const first = Object.values(errors)[0];
  if (first) throw new Error(first);
  return cleanQuickReply(input);
}

/** Admin only (firestore.rules). Returns the new id. */
export async function createQuickReply(input) {
  const { title, body, category } = checked(input);
  const ref = await addDoc(quickRepliesRef, {
    title,
    body,
    category,
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Admin only. createdBy/createdAt are left untouched, as the rules require. */
export function updateQuickReply(id, input) {
  const { title, body, category } = checked(input);
  return updateDoc(doc(quickRepliesRef, id), {
    title,
    body,
    category,
    updatedAt: serverTimestamp(),
  });
}

/** Admin only. */
export function deleteQuickReply(id) {
  return deleteDoc(doc(quickRepliesRef, id));
}

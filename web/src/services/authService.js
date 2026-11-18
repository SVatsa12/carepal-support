import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../firebase";

/** Calls `callback` with the Firebase user (or null) on every auth change. Returns unsubscribe. */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function signOutUser() {
  return firebaseSignOut(auth);
}

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const SIGNED_OUT = { profile: null, loading: false, missing: false, error: null };
const LOADING = { profile: null, loading: true, missing: false, error: null };

/**
 * Live users/{uid} profile. `missing` is true when the doc does not exist.
 * State is keyed by uid so a uid change reads as loading instead of showing the previous profile.
 */
export function useUserProfile(uid) {
  const [snapshot, setSnapshot] = useState({ uid: null, profile: null, error: null });

  useEffect(() => {
    if (!uid) return undefined;

    const unsubscribe = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        setSnapshot({
          uid,
          profile: snap.exists() ? { id: snap.id, ...snap.data() } : null,
          error: null,
        });
      },
      (error) => {
        console.error("Failed to load user profile", error);
        setSnapshot({ uid, profile: null, error });
      },
    );
    return unsubscribe;
  }, [uid]);

  if (!uid) return SIGNED_OUT;
  if (snapshot.uid !== uid) return LOADING;
  return {
    profile: snapshot.profile,
    loading: false,
    missing: !snapshot.profile && !snapshot.error,
    error: snapshot.error,
  };
}

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Member profiles shown in the ticket header (city, care type). Fetched once per member.
const cache = new Map();

/** One-time read of a member's users doc for staff. Returns null until loaded or on error. */
export function useMemberProfile(memberId) {
  const [loaded, setLoaded] = useState({ id: null, profile: null });

  useEffect(() => {
    if (!memberId || cache.has(memberId)) return undefined;
    let active = true;
    getDoc(doc(db, "users", memberId))
      .then((snapshot) => {
        const profile = snapshot.exists() ? snapshot.data() : null;
        cache.set(memberId, profile);
        if (active) setLoaded({ id: memberId, profile });
      })
      .catch((error) => console.error("Failed to load member profile", error));
    return () => {
      active = false;
    };
  }, [memberId]);

  if (!memberId) return null;
  if (cache.has(memberId)) return cache.get(memberId);
  return loaded.id === memberId ? loaded.profile : null;
}

import { useCallback, useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Live list of the member's tickets, newest activity first.
 * Uses the composite index tickets(memberId ASC, lastMessageAt DESC).
 */
export function useMyTickets(uid) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, tickets: [], error: null });
  const key = uid ? `${uid}:${attempt}` : null;

  useEffect(() => {
    if (!uid) return undefined;
    const ticketsQuery = query(
      collection(db, "tickets"),
      where("memberId", "==", uid),
      orderBy("lastMessageAt", "desc"),
    );
    return onSnapshot(
      ticketsQuery,
      (snapshot) => {
        setResult({
          key,
          // "estimate" gives just-created tickets a local time instead of null.
          tickets: snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data({ serverTimestamps: "estimate" }),
          })),
          error: null,
        });
      },
      (error) => {
        console.error("Failed to load tickets", error);
        setResult({ key, tickets: [], error });
      },
    );
  }, [uid, key]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const ready = result.key === key;

  return {
    tickets: ready ? result.tickets : [],
    loading: Boolean(uid) && !ready,
    error: ready ? result.error : null,
    retry,
  };
}

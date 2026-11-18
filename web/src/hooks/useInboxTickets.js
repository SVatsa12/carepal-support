import { useCallback, useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const INBOX_LIMIT = 200;

/**
 * Live list of the most recently active tickets for staff.
 *
 * Filtering happens on the client (utils/filterTickets.js). For an operations inbox of a few
 * hundred open tickets that is instant, keeps the list live with one listener and avoids a
 * composite index for every filter combination. At larger scale we'd move filters into
 * Firestore queries with matching indexes, or into a search service.
 */
export function useInboxTickets(enabled = true) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, tickets: [], error: null });
  const key = enabled ? String(attempt) : null;

  useEffect(() => {
    if (!enabled) return undefined;
    const inboxQuery = query(
      collection(db, "tickets"),
      orderBy("lastMessageAt", "desc"),
      limit(INBOX_LIMIT),
    );
    return onSnapshot(
      inboxQuery,
      (snapshot) => {
        setResult({
          key,
          tickets: snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data({ serverTimestamps: "estimate" }),
          })),
          error: null,
        });
      },
      (error) => {
        console.error("Failed to load the inbox", error);
        setResult({ key, tickets: [], error });
      },
    );
  }, [enabled, key]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const ready = result.key === key;

  return {
    tickets: ready ? result.tickets : [],
    loading: enabled && !ready,
    error: ready ? result.error : null,
    retry,
  };
}

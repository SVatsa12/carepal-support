import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

/** Live ticket document. A ticket the user can't read is reported as notFound. */
export function useTicket(ticketId) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, ticket: null, notFound: false, error: null });
  const key = ticketId ? `${ticketId}:${attempt}` : null;

  useEffect(() => {
    if (!ticketId) return undefined;
    return onSnapshot(
      doc(db, "tickets", ticketId),
      (snapshot) => {
        setResult({
          key,
          ticket: snapshot.exists()
            ? { id: snapshot.id, ...snapshot.data({ serverTimestamps: "estimate" }) }
            : null,
          notFound: !snapshot.exists(),
          error: null,
        });
      },
      (error) => {
        if (error.code === "permission-denied") {
          setResult({ key, ticket: null, notFound: true, error: null });
          return;
        }
        console.error("Failed to load ticket", error);
        setResult({ key, ticket: null, notFound: false, error });
      },
    );
  }, [ticketId, key]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const ready = result.key === key;

  return {
    ticket: ready ? result.ticket : null,
    loading: Boolean(ticketId) && !ready,
    notFound: ready && result.notFound,
    error: ready ? result.error : null,
    retry,
  };
}

import { useCallback, useEffect, useState } from "react";
import { collection, limitToLast, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const MESSAGE_LIMIT = 100;

/**
 * Live messages of a ticket, oldest first (last 100).
 * Metadata changes are included so each message carries `pending` while its write is local.
 */
export function useMessages(ticketId) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, messages: [], error: null });
  const key = ticketId ? `${ticketId}:${attempt}` : null;

  useEffect(() => {
    if (!ticketId) return undefined;
    const messagesQuery = query(
      collection(db, "tickets", ticketId, "messages"),
      orderBy("createdAt", "asc"),
      limitToLast(MESSAGE_LIMIT),
    );
    return onSnapshot(
      messagesQuery,
      { includeMetadataChanges: true },
      (snapshot) => {
        setResult({
          key,
          messages: snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data({ serverTimestamps: "estimate" }),
            pending: d.metadata.hasPendingWrites,
          })),
          error: null,
        });
      },
      (error) => {
        console.error("Failed to load messages", error);
        setResult({ key, messages: [], error });
      },
    );
  }, [ticketId, key]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const ready = result.key === key;

  return {
    messages: ready ? result.messages : [],
    loading: Boolean(ticketId) && !ready,
    error: ready ? result.error : null,
    retry,
  };
}

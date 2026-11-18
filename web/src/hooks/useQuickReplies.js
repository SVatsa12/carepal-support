import { useCallback, useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { quickRepliesQuery } from "../services/quickReplies";

/** Live list of quick replies (staff only), A–Z by title. */
export function useQuickReplies() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, replies: [], error: null });
  const key = String(attempt);

  useEffect(
    () =>
      onSnapshot(
        quickRepliesQuery(),
        (snapshot) => {
          setResult({
            key,
            replies: snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data({ serverTimestamps: "estimate" }),
            })),
            error: null,
          });
        },
        (error) => {
          console.error("Failed to load quick replies", error);
          setResult({ key, replies: [], error });
        },
      ),
    [key],
  );

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const ready = result.key === key;

  return {
    replies: ready ? result.replies : [],
    loading: !ready,
    error: ready ? result.error : null,
    retry,
  };
}

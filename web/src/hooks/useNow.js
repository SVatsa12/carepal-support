import { useContext } from "react";
import { NowContext } from "../context/nowContextValue";

/** Current time in ms from NowProvider; refreshes every 30 s and when the tab regains focus. */
export function useNow() {
  const now = useContext(NowContext);
  if (now === null) throw new Error("useNow must be used inside <NowProvider>.");
  return now;
}

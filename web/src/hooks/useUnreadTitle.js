import { useEffect } from "react";
import { APP_NAME } from "../constants";

/** Shows the unread total in the browser tab: "(3) CarePal Support". */
export function useUnreadTitle(count) {
  useEffect(() => {
    document.title = count > 0 ? `(${count}) ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [count]);
}

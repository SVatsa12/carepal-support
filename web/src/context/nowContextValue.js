import { createContext } from "react";

/** Current time in ms, shared by every wait timer. Provided by NowProvider. */
export const NowContext = createContext(null);

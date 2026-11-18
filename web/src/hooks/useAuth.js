import { useContext } from "react";
import { AuthContext } from "../context/authContextValue";

/** Signed-in user, profile, role and sign-in/out actions from AuthContext. */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

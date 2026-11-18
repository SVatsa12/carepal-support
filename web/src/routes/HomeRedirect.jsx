import { Navigate } from "react-router-dom";
import { FullPageSpinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { homePathForRole } from "../utils/roles";

/** "/" sends members to their tickets, staff to the inbox, everyone else to login. */
export default function HomeRedirect() {
  const { role, loading } = useAuth();

  if (loading) return <FullPageSpinner label="Checking your session" />;
  return <Navigate to={homePathForRole(role) ?? "/login"} replace />;
}

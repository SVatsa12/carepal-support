import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FullPageSpinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { homePathForRole } from "../utils/roles";

/** Renders children (or the nested route) only for signed-in users whose role is in `allow`. */
export default function ProtectedRoute({ allow, children }) {
  const { firebaseUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner label="Checking your session" />;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allow.includes(role)) return <Navigate to={homePathForRole(role)} replace />;
  return children ?? <Outlet />;
}

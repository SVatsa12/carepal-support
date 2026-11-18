import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ROLES, STAFF_ROLES } from "./constants";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomeRedirect from "./routes/HomeRedirect";
import MemberLayout from "./components/layouts/MemberLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MyTickets from "./pages/member/MyTickets";
import NewTicket from "./pages/member/NewTicket";
import TicketChat from "./pages/member/TicketChat";

// Staff pages load on demand; AdminLayout wraps them in <Suspense>.
const Inbox = lazy(() => import("./pages/admin/Inbox"));
const QuickReplies = lazy(() => import("./pages/admin/QuickReplies"));

const MEMBER_ONLY = [ROLES.MEMBER];

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute allow={MEMBER_ONLY}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="tickets" replace />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="tickets/new" element={<NewTicket />} />
            <Route path="tickets/:ticketId" element={<TicketChat />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={STAFF_ROLES}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="inbox" replace />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="inbox/:ticketId" element={<Inbox />} />
            <Route path="quick-replies" element={<QuickReplies />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

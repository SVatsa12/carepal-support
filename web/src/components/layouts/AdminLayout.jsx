import { Suspense, useEffect, useMemo } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Inbox, LogOut, MessageSquareText } from "lucide-react";
import clsx from "clsx";
import Logo from "../Logo";
import { Spinner } from "../Spinner";
import UnreadBadge from "../UnreadBadge";
import { useInboxTickets } from "../../hooks/useInboxTickets";
import { useAuth } from "../../hooks/useAuth";
import { APP_NAME, ROLE_LABELS } from "../../constants";

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium",
          isActive ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100",
        )
      }
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
      {badge}
    </NavLink>
  );
}

/**
 * Full-width shell for agents and admins. Owns the single live inbox listener so the nav badge
 * and the browser tab title stay current on every staff page; pages read it with
 * useOutletContext().
 */
export default function AdminLayout() {
  const { profile, role, signOut } = useAuth();
  const inbox = useInboxTickets();
  const unreadTotal = useMemo(
    () =>
      inbox.tickets.reduce(
        (sum, ticket) => (ticket.status === "resolved" ? sum : sum + (ticket.unreadStaff || 0)),
        0,
      ),
    [inbox.tickets],
  );

  useEffect(() => {
    document.title = unreadTotal > 0 ? `(${unreadTotal}) ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [unreadTotal]);

  return (
    // Fixed-height column: the header stays put and each page fills exactly the rest, so the
    // inbox panes and the chat composer never push the page past the viewport.
    <div className="flex h-dvh flex-col">
      <header className="z-10 shrink-0 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <Link to="/admin/inbox" aria-label="CarePal Support inbox" className="rounded-lg">
            <Logo compact />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            <NavItem
              to="/admin/inbox"
              icon={Inbox}
              label="Inbox"
              badge={<UnreadBadge count={unreadTotal} />}
            />
            <NavItem to="/admin/quick-replies" icon={MessageSquareText} label="Quick replies" />
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-slate-900">{profile?.name}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
              {ROLE_LABELS[role]}
            </span>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <LogOut aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center p-8">
              <Spinner label="Loading page" />
            </div>
          }
        >
          <Outlet context={inbox} />
        </Suspense>
      </main>
    </div>
  );
}

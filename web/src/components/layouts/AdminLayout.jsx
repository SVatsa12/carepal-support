import { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Inbox, LogOut, MessageSquareText } from "lucide-react";
import clsx from "clsx";
import Logo from "../Logo";
import { Spinner } from "../Spinner";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../constants";

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

/** Full-width shell for agents and admins. */
export default function AdminLayout({ inboxBadge }) {
  const { profile, role, signOut } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <Link to="/admin/inbox" aria-label="CarePal Support inbox" className="rounded-lg">
            <Logo compact />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            <NavItem to="/admin/inbox" icon={Inbox} label="Inbox" badge={inboxBadge} />
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
      <main className="flex flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center p-8">
              <Spinner label="Loading page" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

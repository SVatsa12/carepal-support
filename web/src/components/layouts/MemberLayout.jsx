import { Link, NavLink, Outlet, useOutletContext } from "react-router-dom";
import clsx from "clsx";
import Logo from "../Logo";
import UnreadBadge from "../UnreadBadge";
import UserMenu from "../UserMenu";

/** Mobile-first single column for family members. */
export default function MemberLayout() {
  const memberTickets = useOutletContext();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-md items-center gap-2 px-4">
          <Link to="/app/tickets" aria-label="CarePal Support home" className="rounded-lg">
            <Logo compact />
          </Link>
          <nav aria-label="Main" className="ml-auto">
            <NavLink
              to="/app/tickets"
              end
              className={({ isActive }) =>
                clsx(
                  "flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium",
                  isActive ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              My tickets
              <UnreadBadge count={memberTickets.unreadTotal} />
            </NavLink>
          </nav>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
        <Outlet context={memberTickets} />
      </main>
    </div>
  );
}

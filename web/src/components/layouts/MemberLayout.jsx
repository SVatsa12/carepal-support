import { Link, NavLink, Outlet, useMatch, useOutletContext } from "react-router-dom";
import { Plus } from "lucide-react";
import clsx from "clsx";
import Logo from "../Logo";
import UnreadBadge from "../UnreadBadge";
import UserMenu from "../UserMenu";

const NAV_LINK = "flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium";
const navClasses = (active) =>
  clsx(NAV_LINK, active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100");

/**
 * Shell for family members. Phones: a single max-w-md column (as before). From md: a
 * full-width header with "My tickets", "New ticket" and the account menu, and a max-w-7xl
 * content area. Below lg an open ticket takes the whole screen with its own header, so this
 * header hides there.
 */
export default function MemberLayout() {
  const memberTickets = useOutletContext();
  const ticketMatch = useMatch("/app/tickets/:ticketId");
  const onNewTicket = ticketMatch?.params.ticketId === "new";
  const inChat = Boolean(ticketMatch) && !onNewTicket;
  const onTickets = Boolean(useMatch("/app/tickets")) || inChat;

  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className={clsx(
          "sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur",
          inChat && "hidden lg:block",
        )}
      >
        <div className="mx-auto flex h-16 max-w-md items-center gap-2 px-4 md:max-w-7xl md:px-8">
          <Link to="/app/tickets" aria-label="CarePal Support home" className="rounded-lg">
            <Logo compact />
          </Link>
          <nav aria-label="Main" className="ml-auto flex items-center gap-1">
            <NavLink
              to="/app/tickets"
              aria-current={onTickets ? "page" : undefined}
              className={navClasses(onTickets)}
            >
              My tickets
              <UnreadBadge count={memberTickets.unreadTotal} />
            </NavLink>
            <NavLink
              to="/app/tickets/new"
              className={clsx(navClasses(onNewTicket), "hidden md:flex")}
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New ticket
            </NavLink>
          </nav>
          <UserMenu showName />
        </div>
      </header>
      <main
        className={clsx(
          "mx-auto flex w-full flex-1 flex-col",
          inChat
            ? "lg:max-w-7xl lg:px-8 lg:py-6"
            : "max-w-md px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 md:max-w-7xl md:px-8 lg:py-6",
        )}
      >
        <Outlet context={memberTickets} />
      </main>
    </div>
  );
}

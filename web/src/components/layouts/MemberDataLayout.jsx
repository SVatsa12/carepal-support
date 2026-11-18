import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMyTickets } from "../../hooks/useMyTickets";
import { useUnreadTitle } from "../../hooks/useUnreadTitle";

/**
 * No UI of its own: runs the member's single live ticket listener for every member page, keeps
 * the unread total in the tab title, and shares both via useOutletContext().
 */
export default function MemberDataLayout() {
  const { firebaseUser } = useAuth();
  const myTickets = useMyTickets(firebaseUser?.uid);
  const unreadTotal = useMemo(
    () => myTickets.tickets.reduce((sum, ticket) => sum + (ticket.unreadMember || 0), 0),
    [myTickets.tickets],
  );
  useUnreadTitle(unreadTotal);

  const context = useMemo(() => ({ ...myTickets, unreadTotal }), [myTickets, unreadTotal]);
  return <Outlet context={context} />;
}

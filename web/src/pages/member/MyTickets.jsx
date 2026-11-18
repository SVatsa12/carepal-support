import { Link, useLocation, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, MessagesSquare, Plus, TicketCheck } from "lucide-react";
import clsx from "clsx";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import TicketCard, { TicketCardSkeleton } from "../../components/tickets/TicketCard";
import TicketChatPanel from "../../components/member/TicketChatPanel";
import { isOpenStatus } from "../../utils/tickets";

const VIEWS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

// One column on phones, a two-column grid on tablets, back to one column in the desktop list pane.
const LIST_GRID = "space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:block lg:space-y-3";

const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-800";

function ViewToggle({ view, counts, onChange }) {
  return (
    <div
      role="group"
      aria-label="Filter tickets"
      className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1"
    >
      {VIEWS.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={view === item.value}
          onClick={() => onChange(item.value)}
          className={clsx(
            "min-h-11 rounded-lg text-sm font-medium transition",
            view === item.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          {item.label}
          <span className="ml-1.5 text-xs text-slate-500">{counts[item.value]}</span>
        </button>
      ))}
    </div>
  );
}

function TicketList({ loading, error, retry, tickets, view, search, selectedId }) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading tickets" className={LIST_GRID}>
        <TicketCardSkeleton />
        <TicketCardSkeleton />
        <TicketCardSkeleton />
      </div>
    );
  }
  if (error) {
    return (
      <ErrorState
        title="We couldn't load your tickets"
        message="Please check your connection and try again."
        onRetry={retry}
      />
    );
  }
  if (tickets.length === 0) {
    return view === "open" ? (
      <EmptyState
        icon={TicketCheck}
        title="No open tickets"
        message="If something isn't right with your care, raise a ticket and our team will reply here."
        action={
          <Link to="/app/tickets/new" className={PRIMARY_BUTTON}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Raise a ticket
          </Link>
        }
      />
    ) : (
      <EmptyState
        icon={CheckCircle2}
        title="No resolved tickets yet"
        message="Tickets our team has resolved will appear here."
      />
    );
  }
  return (
    <ul className={LIST_GRID}>
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <TicketCard ticket={ticket} search={search} selected={ticket.id === selectedId} />
        </li>
      ))}
    </ul>
  );
}

function NoTicketSelected() {
  return (
    <div className="m-auto w-full max-w-md p-6">
      <EmptyState
        icon={MessagesSquare}
        title="Select a ticket to view the conversation"
        message="Pick a ticket from the list, or raise a new one if something isn't right."
        action={
          <Link to="/app/tickets/new" className={PRIMARY_BUTTON}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            New ticket
          </Link>
        }
      />
    </div>
  );
}

/**
 * The member's tickets. Phones: the list, or the open ticket full screen. Tablets: cards in a
 * two-column grid. Desktop (lg): a two-pane workspace, list on the left and the selected
 * ticket's chat on the right, so /app/tickets and /app/tickets/:ticketId share this page.
 */
export default function MyTickets() {
  // The live list comes from MemberDataLayout, which also feeds the unread badge.
  const { tickets, loading, error, retry } = useOutletContext();
  const { ticketId } = useParams();
  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "resolved" ? "resolved" : "open";

  const openTickets = tickets.filter((ticket) => isOpenStatus(ticket.status));
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "resolved");
  const visible = view === "open" ? openTickets : resolvedTickets;

  function changeView(next) {
    setSearchParams(next === "open" ? {} : { view: next }, { replace: true });
  }

  return (
    <div className="lg:flex lg:h-[calc(100dvh-7rem)] lg:min-h-[32rem] lg:overflow-hidden lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-sm">
      <section
        aria-labelledby="my-tickets-heading"
        className={clsx(
          "space-y-4 pb-20 sm:pb-0 lg:flex lg:w-[380px] lg:shrink-0 lg:flex-col lg:space-y-0 lg:border-r lg:border-slate-200 lg:bg-slate-50",
          ticketId && "hidden",
        )}
      >
        <div className="space-y-4 lg:border-b lg:border-slate-200 lg:bg-white lg:p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 id="my-tickets-heading" className="text-lg font-semibold text-slate-900">
              Your support tickets
            </h1>
            <Link
              to="/app/tickets/new"
              className={clsx(PRIMARY_BUTTON, "hidden sm:inline-flex md:hidden")}
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New ticket
            </Link>
          </div>

          <ViewToggle
            view={view}
            counts={{ open: openTickets.length, resolved: resolvedTickets.length }}
            onChange={changeView}
          />
        </div>

        <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-3">
          <TicketList
            loading={loading}
            error={error}
            retry={retry}
            tickets={visible}
            view={view}
            search={search}
            selectedId={ticketId}
          />
        </div>

        {/* Mobile: floating action button above the home indicator. */}
        <Link
          to="/app/tickets/new"
          className={clsx(
            PRIMARY_BUTTON,
            "fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-10 rounded-full px-5 shadow-lg sm:hidden",
          )}
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
          New ticket
        </Link>
      </section>

      <div
        className={clsx(ticketId ? "flex" : "hidden lg:flex", "min-w-0 flex-1 flex-col lg:min-h-0")}
      >
        {ticketId ? (
          <TicketChatPanel key={ticketId} ticketId={ticketId} backTo={`/app/tickets${search}`} />
        ) : (
          <NoTicketSelected />
        )}
      </div>
    </div>
  );
}

import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { CheckCircle2, Plus, TicketCheck } from "lucide-react";
import clsx from "clsx";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import TicketCard, { TicketCardSkeleton } from "../../components/tickets/TicketCard";
import { isOpenStatus } from "../../utils/tickets";

const VIEWS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

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

function TicketList({ loading, error, retry, tickets, view }) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading tickets" className="space-y-3">
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
    <ul className="space-y-3">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <TicketCard ticket={ticket} />
        </li>
      ))}
    </ul>
  );
}

export default function MyTickets() {
  // The live list comes from MemberDataLayout, which also feeds the unread badge.
  const { tickets, loading, error, retry } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "resolved" ? "resolved" : "open";

  const openTickets = tickets.filter((ticket) => isOpenStatus(ticket.status));
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "resolved");
  const visible = view === "open" ? openTickets : resolvedTickets;

  function changeView(next) {
    setSearchParams(next === "open" ? {} : { view: next }, { replace: true });
  }

  return (
    <section aria-labelledby="my-tickets-heading" className="space-y-4 pb-20 sm:pb-0">
      <div className="flex items-center justify-between gap-3">
        <h1 id="my-tickets-heading" className="text-lg font-semibold text-slate-900">
          Your support tickets
        </h1>
        <Link to="/app/tickets/new" className={clsx(PRIMARY_BUTTON, "hidden sm:inline-flex")}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          New ticket
        </Link>
      </div>

      <ViewToggle
        view={view}
        counts={{ open: openTickets.length, resolved: resolvedTickets.length }}
        onChange={changeView}
      />

      <TicketList loading={loading} error={error} retry={retry} tickets={visible} view={view} />

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
  );
}

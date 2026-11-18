import { useCallback, useMemo } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Filter, Inbox as InboxIcon, MousePointerClick } from "lucide-react";
import clsx from "clsx";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import InboxFilters from "../../components/admin/InboxFilters";
import InboxStats from "../../components/admin/InboxStats";
import InboxRow, { InboxRowSkeleton } from "../../components/admin/InboxRow";
import TicketDetail from "../../components/admin/TicketDetail";
import { useAuth } from "../../hooks/useAuth";
import { useNow } from "../../hooks/useNow";
import { useStaff } from "../../hooks/useStaff";
import {
  DEFAULT_FILTERS,
  countByStatus,
  filterTickets,
  hasNarrowingFilters,
} from "../../utils/filterTickets";

const FILTER_KEYS = Object.keys(DEFAULT_FILTERS);

const EMPTY_BY_STATUS = {
  pending: { icon: CheckCircle2, title: "No pending tickets — nice work" },
  in_progress: { icon: InboxIcon, title: "Nothing in progress right now" },
  resolved: { icon: InboxIcon, title: "No resolved tickets yet" },
  all: { icon: InboxIcon, title: "No tickets yet" },
};

/** Filters live in the URL (?status=…&q=…) so a refresh or a shared link keeps them. */
function readFilters(searchParams) {
  return Object.fromEntries(
    FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? DEFAULT_FILTERS[key]]),
  );
}

function TicketList({ inbox, tickets, filters, selectedId, search, onClear }) {
  const now = useNow();

  if (inbox.loading) {
    return (
      <div aria-busy="true" aria-label="Loading tickets">
        <InboxRowSkeleton />
        <InboxRowSkeleton />
        <InboxRowSkeleton />
        <InboxRowSkeleton />
      </div>
    );
  }
  if (inbox.error) {
    return (
      <div className="p-3">
        <ErrorState title="We couldn't load the inbox" onRetry={inbox.retry} />
      </div>
    );
  }
  if (tickets.length === 0) {
    const narrowed = hasNarrowingFilters(filters);
    const empty = EMPTY_BY_STATUS[filters.status] ?? EMPTY_BY_STATUS.all;
    return (
      <div className="p-3">
        <EmptyState
          icon={narrowed ? Filter : empty.icon}
          title={narrowed ? "No tickets match these filters" : empty.title}
          message={narrowed ? "Try a different search or clear the filters." : undefined}
          action={
            narrowed && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )
          }
        />
      </div>
    );
  }

  return (
    <ul aria-label="Tickets">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <InboxRow
            ticket={ticket}
            selected={ticket.id === selectedId}
            search={search}
            showStatus={filters.status === "all"}
            now={now}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Staff inbox. ≥ lg: list (380px) beside the open ticket. Below lg: the list at /admin/inbox
 * and the ticket full-width at /admin/inbox/:ticketId with a back button.
 */
export default function Inbox() {
  const { ticketId } = useParams();
  const inbox = useOutletContext();
  const { firebaseUser } = useAuth();
  const uid = firebaseUser?.uid;
  const { staff } = useStaff();
  const [searchParams, setSearchParams] = useSearchParams();

  const paramString = searchParams.toString();
  const filters = useMemo(() => readFilters(new URLSearchParams(paramString)), [paramString]);
  const visible = useMemo(
    () => filterTickets(inbox.tickets, filters, uid),
    [inbox.tickets, filters, uid],
  );
  const counts = useMemo(
    () => countByStatus(inbox.tickets, filters, uid),
    [inbox.tickets, filters, uid],
  );
  const activeCount = ["category", "priority", "assignee"].filter(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  ).length;
  const search = paramString ? `?${paramString}` : "";

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value === DEFAULT_FILTERS[key]) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  const setSearch = useCallback((value) => setFilter("q", value.trim()), [setFilter]);

  function clearFilters() {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams();
        for (const key of ["status", "sort"]) {
          if (previous.has(key)) next.set(key, previous.get(key));
        }
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* On phones the open ticket gets the whole screen, so the summary shows with the list only. */}
      <div className={ticketId ? "hidden lg:block" : undefined}>
        <InboxStats tickets={inbox.tickets} />
      </div>
      <div className="flex min-h-0 flex-1">
        <section
          aria-labelledby="inbox-heading"
          className={clsx(
            "min-h-0 w-full flex-col border-slate-200 bg-white lg:w-[380px] lg:shrink-0 lg:border-r",
            ticketId ? "hidden lg:flex" : "flex",
          )}
        >
          <h1 id="inbox-heading" className="sr-only">
            Inbox
          </h1>
          <InboxFilters
            filters={filters}
            counts={counts}
            staff={staff}
            currentUid={uid}
            onChange={setFilter}
            onSearch={setSearch}
            activeCount={activeCount}
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <TicketList
              inbox={inbox}
              tickets={visible}
              filters={filters}
              selectedId={ticketId}
              search={search}
              onClear={clearFilters}
            />
          </div>
        </section>

        <div className={clsx("min-h-0 min-w-0 flex-1", ticketId ? "flex" : "hidden lg:flex")}>
          {ticketId ? (
            <TicketDetail key={ticketId} ticketId={ticketId} backTo={`/admin/inbox${search}`} />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={MousePointerClick}
                title="Select a ticket"
                message="Pick a ticket from the list to read the conversation and reply."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

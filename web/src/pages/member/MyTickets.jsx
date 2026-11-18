import { Link } from "react-router-dom";
import { Plus, TicketCheck } from "lucide-react";
import EmptyState from "../../components/EmptyState";

export default function MyTickets() {
  return (
    <section aria-labelledby="my-tickets-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 id="my-tickets-heading" className="text-lg font-semibold text-slate-900">
          My tickets
        </h1>
        <Link
          to="/app/tickets/new"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          New ticket
        </Link>
      </div>
      <EmptyState
        icon={TicketCheck}
        title="No tickets yet"
        message="When you raise a ticket, you can follow it and chat with our care team here."
      />
    </section>
  );
}

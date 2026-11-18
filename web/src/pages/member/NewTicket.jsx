import { FilePlus2 } from "lucide-react";
import BackLink from "../../components/BackLink";
import EmptyState from "../../components/EmptyState";

export default function NewTicket() {
  return (
    <section aria-labelledby="new-ticket-heading" className="space-y-4">
      <BackLink to="/app/tickets" label="My tickets" />
      <h1 id="new-ticket-heading" className="text-lg font-semibold text-slate-900">
        Raise a new ticket
      </h1>
      <EmptyState
        icon={FilePlus2}
        title="Tell us what happened"
        message="Choose a category, describe the issue and add a photo if it helps."
      />
    </section>
  );
}

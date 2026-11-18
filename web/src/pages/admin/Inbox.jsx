import { useParams } from "react-router-dom";
import { Inbox as InboxIcon } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import StaffThread from "./StaffThread";

export default function Inbox() {
  const { ticketId } = useParams();

  if (ticketId) return <StaffThread ticketId={ticketId} />;

  return (
    <section aria-labelledby="inbox-heading" className="space-y-4 p-4 sm:p-6">
      <h1 id="inbox-heading" className="text-lg font-semibold text-slate-900">
        Inbox
      </h1>
      <EmptyState
        icon={InboxIcon}
        title="No ticket selected"
        message="Tickets from families will appear here, newest waiting first."
      />
    </section>
  );
}

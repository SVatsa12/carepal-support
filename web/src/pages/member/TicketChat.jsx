import { useParams } from "react-router-dom";
import { MessagesSquare } from "lucide-react";
import BackLink from "../../components/BackLink";
import EmptyState from "../../components/EmptyState";

export default function TicketChat() {
  const { ticketId } = useParams();

  return (
    <section aria-labelledby="ticket-chat-heading" className="space-y-4">
      <BackLink to="/app/tickets" label="My tickets" />
      <h1 id="ticket-chat-heading" className="text-lg font-semibold text-slate-900">
        Ticket {ticketId}
      </h1>
      <EmptyState
        icon={MessagesSquare}
        title="Conversation"
        message="Messages between you and the care team will appear here."
      />
    </section>
  );
}

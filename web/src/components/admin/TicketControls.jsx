import { useState } from "react";
import toast from "react-hot-toast";
import { UserCheck } from "lucide-react";
import { Spinner } from "../Spinner";
import { useStaff } from "../../hooks/useStaff";
import { assignTicket, updatePriority, updateStatus } from "../../services/tickets";
import { PRIORITIES, STATUSES } from "../../constants";

const SELECT_CLASS =
  "block min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:border-brand-600 disabled:bg-slate-50 disabled:text-slate-500";

function Field({ id, label, saving, children, className }) {
  return (
    <div className={className}>
      <div className="flex h-5 items-center gap-1.5">
        <label htmlFor={id} className="text-xs font-medium text-slate-600">
          {label}
        </label>
        {saving && <Spinner label={`Saving ${label.toLowerCase()}`} className="h-3.5 w-3.5" />}
      </div>
      {children}
    </div>
  );
}

/**
 * Status, priority and assignee controls for staff. Each change is a transaction that also
 * posts a system message; the select shows a spinner until it lands (no optimistic UI).
 * `actor` is the signed-in staff member: { uid, name }.
 */
export default function TicketControls({ ticket, actor }) {
  const { staff } = useStaff();
  const [saving, setSaving] = useState(null);

  async function run(field, action) {
    setSaving(field);
    try {
      await action();
    } catch (error) {
      console.error(`Failed to update ${field}`, error);
      toast.error(`Couldn't update the ${field}. Please try again.`);
    } finally {
      setSaving(null);
    }
  }

  const people = staff.some((person) => person.id === ticket.assigneeId)
    ? staff
    : [
        ...staff,
        ...(ticket.assigneeId ? [{ id: ticket.assigneeId, name: ticket.assigneeName }] : []),
      ];

  function handleAssign(id) {
    const person = people.find((item) => item.id === id);
    run("assignee", () =>
      assignTicket({
        ticketId: ticket.id,
        assignee: person ? { id: person.id, name: person.name } : null,
        actor,
      }),
    );
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_minmax(0,1.8fr)]">
      <Field id="ticket-status" label="Status" saving={saving === "status"}>
        <select
          id="ticket-status"
          value={ticket.status}
          disabled={Boolean(saving)}
          onChange={(event) =>
            run("status", () =>
              updateStatus({ ticketId: ticket.id, status: event.target.value, actor }),
            )
          }
          className={SELECT_CLASS}
        >
          {STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="ticket-priority" label="Priority" saving={saving === "priority"}>
        <select
          id="ticket-priority"
          value={ticket.priority}
          disabled={Boolean(saving)}
          onChange={(event) =>
            run("priority", () =>
              updatePriority({ ticketId: ticket.id, priority: event.target.value, actor }),
            )
          }
          className={SELECT_CLASS}
        >
          {PRIORITIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="ticket-assignee"
        label="Assignee"
        saving={saving === "assignee"}
        className="col-span-2 sm:col-span-1"
      >
        <div className="flex gap-2">
          <select
            id="ticket-assignee"
            value={ticket.assigneeId ?? ""}
            disabled={Boolean(saving)}
            onChange={(event) => handleAssign(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Unassigned</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.id === actor.uid ? `${person.name} (you)` : person.name}
              </option>
            ))}
          </select>
          {ticket.assigneeId !== actor.uid && (
            <button
              type="button"
              disabled={Boolean(saving)}
              onClick={() =>
                run("assignee", () =>
                  assignTicket({
                    ticketId: ticket.id,
                    assignee: { id: actor.uid, name: actor.name },
                    actor,
                  }),
                )
              }
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 text-sm font-medium text-brand-800 hover:bg-brand-100 disabled:opacity-50"
            >
              <UserCheck aria-hidden="true" className="h-4 w-4" />
              Assign to me
            </button>
          )}
        </div>
      </Field>
    </div>
  );
}

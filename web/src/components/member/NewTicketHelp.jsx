import { Clock, FileText, Phone, Siren } from "lucide-react";
import { HELPLINE, TYPICAL_REPLY_MINUTES } from "../../constants";

function Item({ icon: Icon, title, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <div className="min-w-0 text-sm text-slate-600">
        <h3 className="font-medium text-slate-900">{title}</h3>
        {children}
      </div>
    </li>
  );
}

/** Desktop side card on the New ticket page: what happens after submitting, and what to include. */
export default function NewTicketHelp() {
  return (
    <section
      aria-labelledby="new-ticket-help-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 id="new-ticket-help-heading" className="text-base font-semibold text-slate-900">
        What happens next
      </h2>
      <ul className="mt-4 space-y-4">
        <Item icon={Clock} title="We reply in this app">
          <p>
            Our care team usually replies within {TYPICAL_REPLY_MINUTES} minutes. You'll see the
            reply in the ticket's chat, with an unread badge.
          </p>
        </Item>
        <Item icon={Siren} title="Urgent? Call us">
          <p>
            If someone's safety is at risk or a caregiver hasn't arrived for an urgent visit, call
            the helpline:{" "}
            <a
              href={`tel:${HELPLINE.tel}`}
              className="inline-flex items-center gap-1 font-semibold text-brand-800 underline underline-offset-2"
            >
              <Phone aria-hidden="true" className="h-3.5 w-3.5" />
              {HELPLINE.display}
            </a>
          </p>
        </Item>
        <Item icon={FileText} title="What to include">
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>
              <span className="font-medium text-slate-700">Billing:</span> the invoice number, month
              and the amount that looks wrong.
            </li>
            <li>
              <span className="font-medium text-slate-700">Late nurse:</span> the visit date, the
              scheduled time and when the caregiver arrived (or didn't).
            </li>
            <li>A photo helps for anything you can show, like a bill or a damaged item.</li>
          </ul>
        </Item>
      </ul>
    </section>
  );
}

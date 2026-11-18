import { useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import CategoryIcon from "../tickets/CategoryIcon";
import PriorityPill from "../tickets/PriorityPill";
import StatusBadge from "../tickets/StatusBadge";
import PhotoLightbox from "./PhotoLightbox";
import { CATEGORIES } from "../../constants";
import RelativeTime from "../RelativeTime";

function Heading({ ticket }) {
  const category = CATEGORIES.find((item) => item.value === ticket.category);
  return (
    <>
      <CategoryIcon category={ticket.category} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900">
          {category?.label ?? "Ticket"}
        </span>
        <span className="block text-xs text-slate-500">
          {ticket.ticketNo} · <RelativeTime value={ticket.createdAt} prefix="raised " />
        </span>
      </span>
    </>
  );
}

function Details({ ticket, onOpenPhoto, photoClassName = "h-28 w-28" }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={ticket.status} />
        <PriorityPill priority={ticket.priority} />
        <span className="text-xs text-slate-500">
          <RelativeTime value={ticket.createdAt} prefix="Created " />
        </span>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm text-slate-700 [overflow-wrap:anywhere]">
        {ticket.description}
      </p>
      {ticket.photoUrl && (
        <button
          type="button"
          onClick={onOpenPhoto}
          className="block overflow-hidden rounded-lg border border-slate-200"
          aria-label="Open the attached photo"
        >
          <img
            src={ticket.photoUrl}
            alt=""
            loading="lazy"
            className={clsx(photoClassName, "object-cover transition hover:opacity-90")}
          />
        </button>
      )}
    </>
  );
}

/**
 * The ticket's details: what the member originally reported.
 * `variant="card"` (default): collapsible card shown above the messages.
 * `variant="sidebar"`: always-open panel for the desktop chat's right column.
 */
export default function TicketSummary({ ticket, defaultOpen = true, variant = "card" }) {
  const [open, setOpen] = useState(defaultOpen);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const openPhoto = useCallback(() => setLightboxOpen(true), []);
  const panelId = `summary-${ticket.id}`;

  const lightbox = lightboxOpen && (
    <PhotoLightbox
      src={ticket.photoUrl}
      alt={`Photo attached to ${ticket.ticketNo}`}
      onClose={closeLightbox}
    />
  );

  if (variant === "sidebar") {
    return (
      <section aria-label="Ticket details" className="space-y-4 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ticket details
        </h2>
        <div className="flex items-center gap-3">
          <Heading ticket={ticket} />
        </div>
        <Details ticket={ticket} onOpenPhoto={openPhoto} photoClassName="h-auto w-full max-h-64" />
        {lightbox}
      </section>
    );
  }

  return (
    <section aria-label="Ticket details" className="px-3 pt-3 sm:px-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left"
        >
          <Heading ticket={ticket} />
          <PriorityPill priority={ticket.priority} />
          <ChevronDown
            aria-hidden="true"
            className={clsx("h-5 w-5 shrink-0 text-slate-400 transition", open && "rotate-180")}
          />
          <span className="sr-only">{open ? "Hide details" : "Show details"}</span>
        </button>

        {open && (
          <div id={panelId} className="space-y-3 border-t border-slate-100 px-3 pb-3 pt-3">
            <Details ticket={ticket} onOpenPhoto={openPhoto} />
          </div>
        )}
      </div>
      {lightbox}
    </section>
  );
}

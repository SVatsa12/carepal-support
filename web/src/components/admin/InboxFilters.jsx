import { useCallback, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";
import Modal from "../Modal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { CATEGORIES, PRIORITIES } from "../../constants";
import { SORTS, STATUS_TABS } from "../../utils/filterTickets";

const SEARCH_DEBOUNCE_MS = 200;

const SELECT_CLASS =
  "mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 text-base text-slate-900 focus:border-brand-600 sm:text-sm";

/**
 * Search box that reports its value 200 ms after the last keystroke. `query` is the search
 * currently in the URL: when it changes from outside (back button, "Clear filters") the box
 * follows it.
 */
function SearchBox({ query, onSearch }) {
  const [value, setValue] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);

  if (query !== lastQuery) {
    setLastQuery(query);
    if (value.trim() !== query) setValue(query);
  }

  useEffect(() => {
    if (value.trim() === query) return undefined;
    const timer = setTimeout(() => onSearch(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, query, onSearch]);

  return (
    <div className="relative flex-1">
      <label htmlFor="inbox-search" className="sr-only">
        Search tickets
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        id="inbox-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Name, subject or TCP-…"
        className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-base text-slate-900 focus:border-brand-600 sm:text-sm"
      />
    </div>
  );
}

function SelectField({ id, label, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={SELECT_CLASS}
      >
        {children}
      </select>
    </div>
  );
}

/**
 * Status tabs with live counts, debounced search, and the category / priority / assignee / sort
 * dropdowns: an inline panel from sm up, a "Filters" bottom sheet on phones.
 * `onSearch` must be stable (useCallback) so typing isn't re-debounced on every render.
 */
export default function InboxFilters({
  filters,
  counts,
  staff,
  currentUid,
  onChange,
  onSearch,
  activeCount,
}) {
  const wide = useMediaQuery("(min-width: 640px)");
  const [panelOpen, setPanelOpen] = useState(activeCount > 0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const showMore = wide ? panelOpen : sheetOpen;

  const fields = (
    <div id="inbox-more-filters" className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
      <SelectField
        id="filter-category"
        label="Category"
        value={filters.category}
        onChange={(value) => onChange("category", value)}
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </SelectField>
      <SelectField
        id="filter-priority"
        label="Priority"
        value={filters.priority}
        onChange={(value) => onChange("priority", value)}
      >
        <option value="all">All priorities</option>
        {PRIORITIES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </SelectField>
      <SelectField
        id="filter-assignee"
        label="Assignee"
        value={filters.assignee}
        onChange={(value) => onChange("assignee", value)}
      >
        <option value="all">Anyone</option>
        <option value="me">Me</option>
        <option value="unassigned">Unassigned</option>
        {staff
          .filter((person) => person.id !== currentUid)
          .map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
      </SelectField>
      <SelectField
        id="filter-sort"
        label="Sort by"
        value={filters.sort}
        onChange={(value) => onChange("sort", value)}
      >
        {SORTS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </SelectField>
    </div>
  );

  return (
    <div className="shrink-0 space-y-3 border-b border-slate-200 bg-white p-3">
      <div className="flex gap-2">
        <SearchBox query={filters.q} onSearch={onSearch} />
        <button
          type="button"
          onClick={() => (wide ? setPanelOpen((value) => !value) : setSheetOpen(true))}
          aria-expanded={showMore}
          aria-controls={wide ? "inbox-more-filters" : undefined}
          aria-haspopup={wide ? undefined : "dialog"}
          className={clsx(
            "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium",
            showMore || activeCount
              ? "border-brand-300 bg-brand-50 text-brand-800"
              : "border-slate-300 text-slate-700 hover:bg-slate-50",
          )}
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-700 px-1.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {wide && panelOpen && fields}
      {!wide && sheetOpen && (
        <Modal
          title="Filters"
          onClose={closeSheet}
          footer={
            <button
              type="button"
              onClick={closeSheet}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Show {counts[filters.status]} {counts[filters.status] === 1 ? "ticket" : "tickets"}
            </button>
          }
        >
          {fields}
        </Modal>
      )}

      <div
        role="group"
        aria-label="Status"
        className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1"
      >
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange("status", tab.value)}
              className={clsx(
                "flex min-h-11 flex-col items-center justify-center rounded-md px-1 text-xs font-medium leading-tight transition",
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <span>{tab.label}</span>
              <span className={active ? "text-brand-700" : "text-slate-500"}>
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

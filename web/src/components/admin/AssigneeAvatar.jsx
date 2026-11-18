function initials(name) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts.at(-1)[0] : "")).toUpperCase();
}

/** Initials bubble for the assigned team member, or "Unassigned". Always has readable text. */
export default function AssigneeAvatar({ name }) {
  if (!name) return <span className="text-xs italic text-slate-500">Unassigned</span>;
  return (
    <span className="inline-flex items-center" title={`Assigned to ${name}`}>
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-white"
      >
        {initials(name)}
      </span>
      <span className="sr-only">Assigned to {name}</span>
    </span>
  );
}

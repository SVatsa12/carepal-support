/** Centered icon + title + message, with an optional action (link or button). */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      {Icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon aria-hidden="true" className="h-6 w-6" />
        </span>
      )}
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-600">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

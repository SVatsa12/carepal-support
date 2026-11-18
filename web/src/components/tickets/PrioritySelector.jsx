import clsx from "clsx";
import { PRIORITIES } from "../../constants";

/** Segmented priority buttons (a styled radio group) with a hint for the selected level. */
export default function PrioritySelector({ value, onChange, error, disabled }) {
  const selected = PRIORITIES.find((item) => item.value === value);

  return (
    <fieldset aria-describedby="priority-hint" disabled={disabled}>
      <legend className="text-sm font-medium text-slate-700">How urgent is it?</legend>
      <div className="mt-2 grid grid-cols-4 gap-1 rounded-xl bg-slate-200/70 p-1">
        {PRIORITIES.map((priority) => (
          <label
            key={priority.value}
            className={clsx(
              "flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-1 text-sm font-medium transition",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600",
              value === priority.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <input
              type="radio"
              name="priority"
              value={priority.value}
              checked={value === priority.value}
              onChange={() => onChange(priority.value)}
              className="sr-only"
            />
            {priority.label}
          </label>
        ))}
      </div>
      <p
        id="priority-hint"
        className={clsx("mt-1.5 text-sm", error ? "text-red-700" : "text-slate-600")}
      >
        {error ?? selected?.hint}
      </p>
    </fieldset>
  );
}

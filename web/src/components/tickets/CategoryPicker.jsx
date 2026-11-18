import clsx from "clsx";
import CategoryIcon from "./CategoryIcon";
import { CATEGORIES } from "../../constants";

/** Two-column grid of tappable category cards (a styled radio group). */
export default function CategoryPicker({ value, onChange, error, disabled }) {
  return (
    <fieldset aria-describedby={error ? "category-error" : undefined} disabled={disabled}>
      <legend className="text-sm font-medium text-slate-700">What is this about?</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {CATEGORIES.map((category) => (
          <label
            key={category.value}
            className={clsx(
              "flex min-h-11 cursor-pointer flex-col gap-2 rounded-xl border bg-white p-3 transition",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 has-[:focus-visible]:ring-offset-2",
              value === category.value
                ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600"
                : "border-slate-200 hover:border-slate-300",
              error && !value && "border-red-300",
            )}
          >
            <input
              type="radio"
              name="category"
              value={category.value}
              checked={value === category.value}
              onChange={() => onChange(category.value)}
              className="sr-only"
            />
            <CategoryIcon category={category.value} size="sm" />
            <span className="text-sm font-medium leading-snug text-slate-900">
              {category.label}
            </span>
            <span className="text-xs leading-snug text-slate-500">{category.description}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id="category-error" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

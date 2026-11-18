import { CalendarClock, Clock, HeartPulse, HelpCircle, Receipt, Smartphone } from "lucide-react";
import clsx from "clsx";
import { CATEGORIES } from "../../constants";

const ICONS = { Clock, Receipt, CalendarClock, HeartPulse, Smartphone, HelpCircle };

/** Category icon in a soft brand-coloured tile. Decorative: pair it with visible text. */
export default function CategoryIcon({ category, size = "md", className }) {
  const meta = CATEGORIES.find((item) => item.value === category);
  const Icon = ICONS[meta?.icon] ?? HelpCircle;
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </span>
  );
}

import { Star } from "lucide-react";
import clsx from "clsx";

/** Read-only stars, e.g. "★★★★☆". Screen readers hear "Rated 4 out of 5". */
export default function StarRating({ score, size = "sm", className }) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span className={clsx("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={clsx(
            iconClass,
            value <= score ? "fill-amber-400 text-amber-500" : "fill-none text-slate-300",
          )}
        />
      ))}
      <span className="sr-only">Rated {score} out of 5</span>
    </span>
  );
}

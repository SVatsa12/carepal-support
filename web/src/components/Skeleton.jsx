import clsx from "clsx";

/** Grey pulsing placeholder block. Wrap groups in an element with aria-busy for screen readers. */
export default function Skeleton({ className }) {
  return (
    <div aria-hidden="true" className={clsx("animate-pulse rounded-md bg-slate-200", className)} />
  );
}

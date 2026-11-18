import { formatClock } from "../../utils/time";

/** Status/assignment event, shown as a small centred pill. */
export default function SystemMessage({ message }) {
  return (
    <div className="flex justify-center">
      <p className="rounded-full bg-slate-200/70 px-3 py-1 text-center text-xs text-slate-600">
        {message.text}
        <span className="text-slate-500"> · {formatClock(message.createdAt)}</span>
      </p>
    </div>
  );
}

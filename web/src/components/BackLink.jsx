import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackLink({ to, label }) {
  return (
    <Link
      to={to}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-600 hover:text-slate-900"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      {label}
    </Link>
  );
}

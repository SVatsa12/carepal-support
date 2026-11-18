import { MessageSquareText } from "lucide-react";
import EmptyState from "../../components/EmptyState";

export default function QuickReplies() {
  return (
    <section aria-labelledby="quick-replies-heading" className="space-y-4 p-4 sm:p-6">
      <h1 id="quick-replies-heading" className="text-lg font-semibold text-slate-900">
        Quick replies
      </h1>
      <EmptyState
        icon={MessageSquareText}
        title="No quick replies yet"
        message="Saved answers for common questions will be listed here."
      />
    </section>
  );
}

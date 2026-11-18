import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Skeleton from "../../components/Skeleton";
import QuickReplyEditor from "../../components/admin/QuickReplyEditor";
import { useAuth } from "../../hooks/useAuth";
import { useNow } from "../../hooks/useNow";
import { useQuickReplies } from "../../hooks/useQuickReplies";
import { deleteQuickReply } from "../../services/quickReplies";
import { ROLES } from "../../constants";
import { quickReplyCategoryLabel } from "../../utils/quickReplies";
import { formatRelative } from "../../utils/time";

const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700";

function ReplyCard({ reply, canEdit, onEdit, now }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteQuickReply(reply.id);
      toast.success("Quick reply deleted");
    } catch (error) {
      console.error("Failed to delete quick reply", error);
      toast.error("Couldn't delete the quick reply. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <li className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{reply.title}</h2>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
          {quickReplyCategoryLabel(reply.category)}
        </span>
      </div>
      <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line break-words text-sm text-slate-600">
        {reply.body}
      </p>
      <p className="mt-2 text-xs text-slate-500">Updated {formatRelative(reply.updatedAt, now)}</p>

      {canEdit &&
        (confirming ? (
          <div
            role="group"
            aria-label={`Confirm deleting ${reply.title}`}
            className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 p-2"
          >
            <p className="flex-1 text-sm text-red-900">Delete this quick reply?</p>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
              Delete
            </button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(reply)}
              aria-label={`Edit ${reply.title}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil aria-hidden="true" className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${reply.title}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Delete
            </button>
          </div>
        ))}
    </li>
  );
}

/** Saved answers for common questions. Everyone on staff can read them; admins manage them. */
export default function QuickReplies() {
  const { role, profile } = useAuth();
  const canEdit = role === ROLES.ADMIN;
  const now = useNow();
  const { replies, loading, error, retry } = useQuickReplies();
  // undefined: editor closed; null: creating; object: editing that reply.
  const [editing, setEditing] = useState(undefined);
  const closeEditor = useCallback(() => setEditing(undefined), []);

  let content;
  if (loading) {
    content = (
      <div
        aria-busy="true"
        aria-label="Loading quick replies"
        className="grid gap-3 sm:grid-cols-2"
      >
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  } else if (error) {
    content = <ErrorState title="We couldn't load quick replies" onRetry={retry} />;
  } else if (replies.length === 0) {
    content = (
      <EmptyState
        icon={MessageSquareText}
        title="No quick replies yet"
        message="Save answers to common questions so the team can reply in seconds."
        action={
          canEdit ? (
            <button type="button" onClick={() => setEditing(null)} className={PRIMARY_BUTTON}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Create your first quick reply
            </button>
          ) : (
            <p className="text-sm text-slate-600">Ask an admin to add the first one.</p>
          )
        }
      />
    );
  } else {
    content = (
      <ul className="grid gap-3 sm:grid-cols-2">
        {replies.map((reply) => (
          <ReplyCard key={reply.id} reply={reply} canEdit={canEdit} onEdit={setEditing} now={now} />
        ))}
      </ul>
    );
  }

  return (
    <section
      aria-labelledby="quick-replies-heading"
      className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="quick-replies-heading" className="text-lg font-semibold text-slate-900">
            Quick replies
          </h1>
          <p className="text-sm text-slate-600">
            {canEdit
              ? "Type / in a ticket's message box to use them."
              : "Type / in a ticket's message box to use them. Only admins can edit this list."}
          </p>
        </div>
        {canEdit && replies.length > 0 && (
          <button type="button" onClick={() => setEditing(null)} className={PRIMARY_BUTTON}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            New quick reply
          </button>
        )}
      </div>

      {content}

      {editing !== undefined && (
        <QuickReplyEditor reply={editing} agentName={profile?.name} onClose={closeEditor} />
      )}
    </section>
  );
}

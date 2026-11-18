import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import Modal from "../Modal";
import { createQuickReply, updateQuickReply } from "../../services/quickReplies";
import { CATEGORIES, QUICK_REPLY_LIMITS, QUICK_REPLY_PLACEHOLDERS } from "../../constants";
import { fillTemplate, firstName } from "../../utils/text";
import { validateQuickReply } from "../../utils/quickReplies";

const INPUT_CLASS =
  "mt-1 block w-full rounded-lg border bg-white px-3 text-base text-slate-900 focus:border-brand-600 sm:text-sm";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}

function Counter({ length, max }) {
  return (
    <span className={clsx("text-xs", length > max ? "text-red-700" : "text-slate-500")}>
      {length}/{max}
    </span>
  );
}

/** Create or edit a quick reply, with clickable placeholder chips and a live preview. */
export default function QuickReplyEditor({ reply, agentName, onClose }) {
  const [form, setForm] = useState({
    title: reply?.title ?? "",
    category: reply?.category ?? "any",
    body: reply?.body ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  const errors = submitted ? validateQuickReply(form) : {};
  const samples = Object.fromEntries(
    QUICK_REPLY_PLACEHOLDERS.map((item) => [item.key, item.sample]),
  );
  samples.agentName = firstName(agentName) || samples.agentName;
  const update = (field) => (event) =>
    setForm((value) => ({ ...value, [field]: event.target.value }));

  function insertPlaceholder(key) {
    const element = bodyRef.current;
    const token = `{{${key}}}`;
    const start = element?.selectionStart ?? form.body.length;
    const end = element?.selectionEnd ?? form.body.length;
    setForm((value) => ({
      ...value,
      body: value.body.slice(0, start) + token + value.body.slice(end),
    }));
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + token.length, start + token.length);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateQuickReply(form)).length) return;
    setSaving(true);
    try {
      if (reply) await updateQuickReply(reply.id, form);
      else await createQuickReply(form);
      toast.success(reply ? "Quick reply updated" : "Quick reply created");
      onClose();
    } catch (error) {
      console.error("Failed to save quick reply", error);
      toast.error(
        error?.code === "permission-denied"
          ? "Only admins can change quick replies."
          : "Couldn't save the quick reply. Please try again.",
      );
      setSaving(false);
    }
  }

  return (
    <Modal
      title={reply ? "Edit quick reply" : "New quick reply"}
      onClose={onClose}
      initialFocusRef={titleRef}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="quick-reply-form"
            disabled={saving}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <form id="quick-reply-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="qr-title" className="text-sm font-medium text-slate-800">
                Title
              </label>
              <Counter length={form.title.trim().length} max={QUICK_REPLY_LIMITS.TITLE_MAX} />
            </div>
            <input
              id="qr-title"
              ref={titleRef}
              value={form.title}
              onChange={update("title")}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "qr-title-error" : undefined}
              placeholder="e.g. Nurse running late"
              className={clsx(
                INPUT_CLASS,
                "min-h-11",
                errors.title ? "border-red-400" : "border-slate-300",
              )}
            />
            <FieldError id="qr-title-error" message={errors.title} />
          </div>
          <div>
            <label htmlFor="qr-category" className="text-sm font-medium text-slate-800">
              Category
            </label>
            <select
              id="qr-category"
              value={form.category}
              onChange={update("category")}
              className={clsx(INPUT_CLASS, "min-h-11 border-slate-300")}
            >
              <option value="any">Any category</option>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="qr-body" className="text-sm font-medium text-slate-800">
              Message
            </label>
            <Counter length={form.body.trim().length} max={QUICK_REPLY_LIMITS.BODY_MAX} />
          </div>
          <div
            role="group"
            aria-label="Insert a placeholder"
            className="mt-1 flex flex-wrap gap-1.5"
          >
            {QUICK_REPLY_PLACEHOLDERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => insertPlaceholder(item.key)}
                title={item.label}
                className="min-h-9 rounded-full border border-brand-200 bg-brand-50 px-3 font-mono text-xs text-brand-800 hover:bg-brand-100"
              >
                <span className="sr-only">Insert </span>
                {`{{${item.key}}}`}
              </button>
            ))}
          </div>
          <textarea
            id="qr-body"
            ref={bodyRef}
            rows={6}
            value={form.body}
            onChange={update("body")}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "qr-body-error" : undefined}
            className={clsx(
              INPUT_CLASS,
              "py-2",
              errors.body ? "border-red-400" : "border-slate-300",
            )}
          />
          <FieldError id="qr-body-error" message={errors.body} />
        </div>

        <section aria-labelledby="qr-preview-heading">
          <h3 id="qr-preview-heading" className="text-sm font-medium text-slate-800">
            Preview
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            With sample values: {samples.memberName}, {samples.ticketNo}, {samples.agentName}.
          </p>
          <div className="mt-2 min-h-16 whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 [overflow-wrap:anywhere]">
            {form.body.trim() ? (
              fillTemplate(form.body, samples)
            ) : (
              <span className="text-slate-400">Your message will appear here.</span>
            )}
          </div>
        </section>
      </form>
    </Modal>
  );
}

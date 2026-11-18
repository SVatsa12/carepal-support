import { useState } from "react";
import toast from "react-hot-toast";
import { Heart, Loader2, Star } from "lucide-react";
import clsx from "clsx";
import StarRating from "../tickets/StarRating";
import { RatingError, submitRating } from "../../services/tickets";
import { RATING_COMMENT_MAX, RATING_LABELS } from "../../constants";

/** Native radios (arrow keys move between stars) styled as five large tappable stars. */
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset>
      <legend className="text-base font-semibold text-slate-900">How did we do?</legend>
      <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((score) => (
          <div key={score}>
            <input
              id={`rating-${score}`}
              type="radio"
              name="rating"
              value={score}
              checked={value === score}
              onChange={() => onChange(score)}
              className="peer sr-only"
            />
            <label
              htmlFor={`rating-${score}`}
              onMouseEnter={() => setHovered(score)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600"
            >
              <Star
                aria-hidden="true"
                className={clsx(
                  "h-8 w-8 transition",
                  score <= shown ? "fill-amber-400 text-amber-500" : "fill-none text-slate-300",
                )}
              />
              <span className="sr-only">
                {score} {score === 1 ? "star" : "stars"}, {RATING_LABELS[score]}
              </span>
            </label>
          </div>
        ))}
        <span aria-hidden="true" className="ml-2 text-sm font-medium text-slate-700">
          {shown ? RATING_LABELS[shown] : ""}
        </span>
      </div>
    </fieldset>
  );
}

/**
 * Shown to the member on a resolved ticket: rate 1–5 stars with an optional comment, once.
 * Once the rating is saved (live from the ticket listener) it becomes a thank-you note.
 */
export default function RatingCard({ ticket }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (ticket.rating) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3" role="status">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Heart aria-hidden="true" className="h-4 w-4 fill-rose-500 text-rose-500" />
          Thanks for your feedback!
        </p>
        <div className="mt-1 flex items-center gap-2">
          <StarRating score={ticket.rating.score} size="md" />
          <span className="text-sm text-slate-700">{RATING_LABELS[ticket.rating.score]}</span>
        </div>
        {ticket.rating.comment && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
            “{ticket.rating.comment}”
          </p>
        )}
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!score) {
      setError("Choose a number of stars first.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await submitRating({ ticketId: ticket.id, score, comment });
      toast.success("Thanks for rating us!");
    } catch (submitError) {
      console.error("Rating failed", submitError);
      const message =
        submitError instanceof RatingError
          ? submitError.message
          : "We couldn't save your rating. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const tooLong = comment.trim().length > RATING_COMMENT_MAX;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <StarInput
        value={score}
        onChange={(value) => {
          setScore(value);
          setError("");
        }}
      />
      {score > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <label htmlFor="rating-comment" className="text-sm font-medium text-slate-800">
              Anything to add? <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <span className={clsx("text-xs", tooLong ? "text-red-700" : "text-slate-500")}>
              {comment.trim().length}/{RATING_COMMENT_MAX}
            </span>
          </div>
          <textarea
            id="rating-comment"
            rows={2}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            aria-invalid={tooLong}
            className="mt-1 block w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 focus:border-brand-600 sm:text-sm"
          />
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving || tooLong}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {saving && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
        {saving ? "Sending…" : "Submit rating"}
      </button>
    </form>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import BackLink from "../../components/BackLink";
import CategoryPicker from "../../components/tickets/CategoryPicker";
import PrioritySelector from "../../components/tickets/PrioritySelector";
import PhotoPicker from "../../components/tickets/PhotoPicker";
import { useAuth } from "../../hooks/useAuth";
import { createTicket } from "../../services/tickets";
import {
  isUploadConfigured,
  uploadTicketPhoto,
  UploadError,
  validateImage,
} from "../../services/upload";
import { TICKET_LIMITS, TYPICAL_REPLY_MINUTES } from "../../constants";
import { validateTicketInput } from "../../utils/tickets";

const FIELD_ORDER = ["category", "priority", "subject", "description"];

const inputClasses = (hasError) =>
  clsx(
    "mt-1 block w-full rounded-xl border bg-white px-3 text-base text-slate-900 shadow-sm focus:border-brand-600 sm:text-sm",
    hasError ? "border-red-400" : "border-slate-300",
  );

function CharCount({ id, length, max }) {
  return (
    <span
      id={id}
      className={clsx("text-xs", length > max ? "font-medium text-red-700" : "text-slate-500")}
    >
      {length}/{max}
    </span>
  );
}

function focusField(field) {
  const target =
    field === "category" || field === "priority"
      ? document.querySelector(`input[name="${field}"]`)
      : document.getElementById(field);
  target?.focus();
}

export default function NewTicket() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  // { file, previewUrl, uploadedUrl } — uploadedUrl is kept so a retry doesn't upload twice.
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const previewUrl = photo?.previewUrl;
  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function clearError(field) {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  function handlePhotoSelect(file) {
    try {
      validateImage(file);
    } catch (error) {
      setPhotoError(error.message);
      return;
    }
    setPhotoError(null);
    setPhoto({ file, previewUrl: URL.createObjectURL(file), uploadedUrl: null });
  }

  function handlePhotoRemove() {
    setPhoto(null);
    setPhotoError(null);
  }

  async function uploadPhotoIfNeeded() {
    if (!photo) return null;
    if (photo.uploadedUrl) return photo.uploadedUrl;
    setProgress(0);
    try {
      const url = await uploadTicketPhoto(photo.file, { onProgress: setProgress });
      setPhoto((current) => (current ? { ...current, uploadedUrl: url } : current));
      return url;
    } finally {
      setProgress(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validateTicketInput({ category, priority, subject, description });
    setErrors(nextErrors);
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      let photoUrl;
      try {
        photoUrl = await uploadPhotoIfNeeded();
      } catch (error) {
        console.error("Photo upload failed", error);
        const message =
          error instanceof UploadError ? error.message : "Photo upload failed. Please try again.";
        setPhotoError(`${message} Or remove the photo to raise the ticket without it.`);
        toast.error(message);
        return;
      }

      const { id, ticketNo } = await createTicket({
        profile,
        category,
        priority,
        subject,
        description,
        photoUrl,
      });
      toast.success(
        `Ticket ${ticketNo} raised — our team usually replies within ${TYPICAL_REPLY_MINUTES} minutes`,
        { duration: 6000 },
      );
      navigate(`/app/tickets/${id}`);
    } catch (error) {
      console.error("Ticket creation failed", error);
      toast.error("We couldn't raise your ticket. Please check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const uploadUnavailable = isUploadConfigured()
    ? null
    : "Photo uploads aren't available right now — describe the issue in words instead.";

  return (
    <section aria-labelledby="new-ticket-heading" className="space-y-4">
      <BackLink to="/app/tickets" label="Your tickets" />
      <div>
        <h1 id="new-ticket-heading" className="text-lg font-semibold text-slate-900">
          Raise a new ticket
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tell us what happened and our care team will reply in this app.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <CategoryPicker
          value={category}
          disabled={submitting}
          error={errors.category}
          onChange={(value) => {
            setCategory(value);
            clearError("category");
          }}
        />

        <PrioritySelector
          value={priority}
          disabled={submitting}
          error={errors.priority}
          onChange={(value) => {
            setPriority(value);
            clearError("priority");
          }}
        />

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="subject" className="text-sm font-medium text-slate-700">
              Subject
            </label>
            <CharCount
              id="subject-count"
              length={subject.trim().length}
              max={TICKET_LIMITS.SUBJECT_MAX}
            />
          </div>
          <input
            id="subject"
            type="text"
            value={subject}
            maxLength={TICKET_LIMITS.SUBJECT_MAX}
            disabled={submitting}
            placeholder="e.g. Nurse didn't arrive for the morning shift"
            onChange={(event) => {
              setSubject(event.target.value);
              clearError("subject");
            }}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={clsx("subject-count", errors.subject && "subject-error")}
            className={clsx(inputClasses(errors.subject), "min-h-11")}
          />
          {errors.subject && (
            <p id="subject-error" className="mt-1 text-sm text-red-700">
              {errors.subject}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Details
            </label>
            <CharCount
              id="description-count"
              length={description.trim().length}
              max={TICKET_LIMITS.DESCRIPTION_MAX}
            />
          </div>
          <textarea
            id="description"
            rows={5}
            value={description}
            disabled={submitting}
            placeholder="What happened, when, and who was involved? Include anything that helps us act quickly."
            onChange={(event) => {
              setDescription(event.target.value);
              clearError("description");
            }}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={clsx("description-count", errors.description && "description-error")}
            className={clsx(inputClasses(errors.description), "resize-y py-2")}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-700">
              {errors.description}
            </p>
          )}
        </div>

        <PhotoPicker
          previewUrl={photo?.previewUrl}
          fileName={photo?.file.name}
          progress={progress}
          error={photoError}
          disabled={submitting}
          unavailableReason={uploadUnavailable}
          onSelect={handlePhotoSelect}
          onRemove={handlePhotoRemove}
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="h-4 w-4" />
          )}
          {submitting
            ? progress !== null
              ? "Uploading photo…"
              : "Raising ticket…"
            : "Raise ticket"}
        </button>
      </form>
    </section>
  );
}

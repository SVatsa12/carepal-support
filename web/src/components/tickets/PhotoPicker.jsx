import { useId } from "react";
import { ImagePlus, X } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES } from "../../services/upload";
import { MAX_UPLOAD_MB } from "../../constants";

/**
 * Optional photo field: pick, preview, remove, and an upload progress bar.
 * `progress` is null when no upload is running.
 */
export default function PhotoPicker({
  previewUrl,
  fileName,
  progress,
  error,
  disabled,
  unavailableReason,
  onSelect,
  onRemove,
}) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  function handleChange(event) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (file) onSelect(file);
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">
        Photo <span className="font-normal text-slate-500">(optional)</span>
      </p>

      {previewUrl ? (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
          <img
            src={previewUrl}
            alt="Selected photo preview"
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-700">{fileName}</p>
            {progress !== null && (
              <div className="mt-2">
                <div
                  role="progressbar"
                  aria-label="Photo upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-2 overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className="h-full rounded-full bg-brand-600 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Uploading… {progress}%</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove photo"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={
            unavailableReason || disabled
              ? "mt-2 flex min-h-14 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-400"
              : "mt-2 flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:border-brand-400 hover:bg-brand-50/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600"
          }
        >
          <ImagePlus aria-hidden="true" className="h-5 w-5" />
          Add a photo
          <input
            id={inputId}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleChange}
            disabled={disabled || Boolean(unavailableReason)}
            aria-describedby={hintId}
            className="sr-only"
          />
        </label>
      )}

      <p
        id={hintId}
        className={error ? "mt-1 text-sm text-red-700" : "mt-1 text-xs text-slate-500"}
      >
        {error ?? unavailableReason ?? `JPG, PNG, WebP or HEIC, up to ${MAX_UPLOAD_MB} MB.`}
      </p>
    </div>
  );
}

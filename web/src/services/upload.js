import imageCompression from "browser-image-compression";
import { MAX_UPLOAD_MB } from "../constants";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_FOLDER = "carepal-support";
const UPLOAD_TIMEOUT_MS = 60_000;
const CLOUDINARY_URL_PREFIX = "https://res.cloudinary.com/";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const HEIC_TYPES = ["image/heic", "image/heif"];

/** Upload failure with a `code` for logic and a `message` that is safe to show the user. */
export class UploadError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "UploadError";
    this.code = code;
  }
}

export function isUploadConfigured() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** Throws UploadError when `file` is not an accepted image type or exceeds MAX_UPLOAD_MB. */
export function validateImage(file) {
  if (!file) throw new UploadError("no-file", "Choose a photo to upload.");
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new UploadError("invalid-type", "Please choose a JPG, PNG, WebP or HEIC photo.");
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new UploadError(
      "too-large",
      `That photo is larger than ${MAX_UPLOAD_MB} MB. Please choose a smaller one.`,
    );
  }
}

async function compress(file) {
  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });
  } catch (error) {
    console.error("Image compression failed", error);
    if (HEIC_TYPES.includes(file.type)) {
      throw new UploadError(
        "heic-unsupported",
        "This browser can't read HEIC photos. Please share the photo as a JPG instead.",
      );
    }
    throw new UploadError("compress-failed", "We couldn't read that photo. Try a different one.");
  }
}

function postToCloudinary(blob, fileName, onProgress) {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", blob, fileName);
    body.append("upload_preset", UPLOAD_PRESET);
    body.append("folder", UPLOAD_FOLDER);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let response = null;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        // Non-JSON response; handled below.
      }
      const url = response?.secure_url;
      if (xhr.status >= 200 && xhr.status < 300 && url?.startsWith(CLOUDINARY_URL_PREFIX)) {
        resolve(url);
        return;
      }
      console.error("Cloudinary upload rejected", xhr.status, response?.error?.message);
      reject(new UploadError("rejected", "The photo upload was rejected. Please try again."));
    };
    xhr.onerror = () =>
      reject(new UploadError("network", "Photo upload failed. Check your connection and retry."));
    xhr.ontimeout = () =>
      reject(new UploadError("timeout", "Photo upload took too long. Please try again."));

    xhr.send(body);
  });
}

/**
 * Validates, compresses and uploads a ticket photo to Cloudinary.
 * Resolves with the https://res.cloudinary.com/ URL; rejects with UploadError.
 */
export async function uploadTicketPhoto(file, { onProgress } = {}) {
  if (!isUploadConfigured()) {
    throw new UploadError("not-configured", "Photo uploads aren't set up yet.");
  }
  validateImage(file);
  const compressed = await compress(file);
  onProgress?.(0);
  return postToCloudinary(compressed, file.name, onProgress);
}

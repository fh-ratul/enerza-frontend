// The API takes images up to 5 MB. Uploads pass through this app's own
// server first, where the hosting platform caps a request at about 4.5 MB,
// so the limit offered to people is 4 MB.
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Why a file cannot be uploaded, or null when it can. */
export const validatePhoto = (file: File): string | null => {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return "Only JPEG, PNG or WebP images can be uploaded.";
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return "The image is larger than 4 MB. Please choose a smaller one.";
  }

  return null;
};

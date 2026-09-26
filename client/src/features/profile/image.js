const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/**
 * Shrink an image file in the browser to a square-ish avatar data URL
 * (longest side `maxSize`). A 5 MB photo becomes ~50 KB, so uploads are
 * fast and well under the server's body limit.
 */
export async function resizeImageToDataUrl(file, maxSize = 512) {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Please choose a PNG, JPEG, WebP or GIF image");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Image must be under 10 MB");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // WebP keeps transparency and is small; fall back where it can't be encoded
  const webp = canvas.toDataURL("image/webp", 0.85);
  if (webp.startsWith("data:image/webp")) return webp;

  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

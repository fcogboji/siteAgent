/**
 * Client-side image compression so any size photo uploads quickly.
 * - Compress when file > 1MB (most phone photos).
 * - Tiered: very large → 1280px/0.68, large → 1440px/0.74, else 1600px/0.78.
 * - Target ~1MB so uploads finish fast even on slow connections.
 */
const COMPRESS_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1MB – compress above this
const TARGET_MAX_BYTES = 1 * 1024 * 1024; // 1MB – faster uploads
const MIN_QUALITY = 0.5;

function pickSettings(fileSizeBytes: number): { maxDim: number; quality: number } {
  if (fileSizeBytes > 5 * 1024 * 1024) return { maxDim: 1280, quality: 0.68 };
  if (fileSizeBytes > 2 * 1024 * 1024) return { maxDim: 1440, quality: 0.74 };
  return { maxDim: 1600, quality: 0.78 };
}

export async function compressImageIfNeeded(file: File): Promise<File | Blob> {
  if (!file.type.startsWith("image/") || file.size <= COMPRESS_THRESHOLD_BYTES) {
    return file;
  }
  const { maxDim: MAX_DIM, quality: QUALITY } = pickSettings(file.size);

  return new Promise((resolve) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= MAX_DIM && height <= MAX_DIM && file.size <= COMPRESS_THRESHOLD_BYTES) {
        resolve(file);
        return;
      }
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const tryQuality = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            if (blob.size <= TARGET_MAX_BYTES || q <= MIN_QUALITY) {
              resolve(blob);
              return;
            }
            tryQuality(Math.max(MIN_QUALITY, q - 0.12));
          },
          "image/jpeg",
          q
        );
      };
      tryQuality(QUALITY);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

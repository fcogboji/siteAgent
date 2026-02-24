/**
 * Client-side image compression. Resizes to max 1920px and compresses to ~0.8 quality
 * so uploads stay under ~2MB and work without Blob.
 */
const MAX_DIM = 1920;
const MAX_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5MB target
const QUALITY = 0.82;

export async function compressImageIfNeeded(file: File): Promise<File | Blob> {
  if (!file.type.startsWith("image/") || file.size <= MAX_SIZE_BYTES) {
    return file;
  }
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= MAX_DIM && height <= MAX_DIM && file.size <= MAX_SIZE_BYTES) {
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
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        "image/jpeg",
        QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

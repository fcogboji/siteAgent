"use server";

import { put } from "@vercel/blob";
import { requireEffectiveUserIdForJobs } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_DATA_URL_SIZE = 6 * 1024 * 1024; // 6MB fallback when no Blob
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  const userId = await requireEffectiveUserIdForJobs();
  const file = formData.get("file") as File | null;
  const jobId = formData.get("jobId") as string | null;
  if (!file || !jobId) return { error: "Missing file or job" };

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId },
  });
  if (!job) return { error: "Job not found" };

  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." };
  }

  const size = file.size;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`jobs/${jobId}/${file.name}`, file, { access: "public" });
    return { url: blob.url };
  }

  // Fallback: store as data URL in DB (no Blob config)
  if (size > MAX_DATA_URL_SIZE) {
    return { error: "Image too large. Use an image under 6MB or add Vercel Blob for larger uploads." };
  }
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${type};base64,${base64}`;
  return { url: dataUrl };
}

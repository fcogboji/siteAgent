"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function createJob(formData: FormData) {
  const userId = await requireUserId();
  const title = formData.get("title") as string;
  const clientName = (formData.get("clientName") as string) || null;
  const address = (formData.get("address") as string) || null;

  if (!title?.trim()) return { error: "Job title is required" };

  const job = await prisma.job.create({
    data: {
      userId,
      title: title.trim(),
      clientName: clientName?.trim() || null,
      address: address?.trim() || null,
    },
  });
  revalidatePath("/");
  redirect(`/jobs/${job.id}`);
}

export async function updateJobNotes(jobId: string, notes: string) {
  const userId = await requireUserId();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Job not found" };

  await prisma.job.update({
    where: { id: jobId },
    data: { notes: notes || null },
  });
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

export type PhotoTag = "before" | "after" | "condition" | null;

export async function addPhotoToJob(
  jobId: string,
  imageUrl: string,
  note?: string,
  tag?: PhotoTag,
  latitude?: number | null,
  longitude?: number | null
) {
  const userId = await requireUserId();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Job not found" };

  const validTag =
    tag === "before" || tag === "after" || tag === "condition" ? tag : null;
  await prisma.photo.create({
    data: {
      jobId,
      imageUrl,
      note: note || null,
      tag: validTag,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
    },
  });
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

export async function updatePhotoTag(
  jobId: string,
  photoId: string,
  tag: PhotoTag
) {
  const userId = await requireUserId();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Job not found" };

  const validTag =
    tag === "before" || tag === "after" || tag === "condition" ? tag : null;
  await prisma.photo.updateMany({
    where: { id: photoId, jobId },
    data: { tag: validTag },
  });
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

export async function saveSignature(jobId: string, signatureImageUrl: string, signedBy?: string) {
  const userId = await requireUserId();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Job not found" };

  await prisma.signature.upsert({
    where: { jobId },
    create: { jobId, signatureImageUrl, signedBy: signedBy || null },
    update: { signatureImageUrl, signedBy: signedBy || null },
  });
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true };
}

export async function generateReportSlug(jobId: string): Promise<string | null> {
  const userId = await requireUserId();
  const job = await prisma.job.findFirst({
    where: { id: jobId, userId },
    include: { photos: true, signature: true },
  });
  if (!job) return null;

  const slug = job.reportSlug ?? `r_${nanoid(12)}`;
  await prisma.job.update({
    where: { id: jobId },
    data: { reportSlug: slug },
  });
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath(`/report/${slug}`);
  return slug;
}

export async function deleteJob(jobId: string) {
  const userId = await requireUserId();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Job not found" };

  await prisma.job.delete({ where: { id: jobId } });
  revalidatePath("/");
  redirect("/");
}

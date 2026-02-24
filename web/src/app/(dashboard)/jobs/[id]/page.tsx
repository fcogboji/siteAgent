import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { JobDetailClient } from "./job-detail-client";
import { format } from "date-fns";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) notFound();

  const job = await prisma.job.findFirst({
    where: { id, userId },
    include: { photos: { orderBy: { createdAt: "asc" } }, signature: true },
  });
  if (!job) notFound();

  const reportUrl = job.reportSlug
    ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/report/${job.reportSlug}`
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="truncate text-lg font-bold text-stone-900">{job.title}</h1>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <dl className="grid gap-2 text-sm">
          {job.clientName && (
            <>
              <dt className="text-stone-500">Client</dt>
              <dd className="font-medium text-stone-900">{job.clientName}</dd>
            </>
          )}
          {job.address && (
            <>
              <dt className="text-stone-500">Address</dt>
              <dd className="text-stone-700">{job.address}</dd>
            </>
          )}
          <dt className="text-stone-500">Created</dt>
          <dd className="text-stone-600">{format(job.createdAt, "d MMM yyyy, HH:mm")}</dd>
        </dl>
      </div>

      <JobDetailClient
        jobId={job.id}
        jobTitle={job.title}
        clientName={job.clientName}
        address={job.address}
        photos={job.photos}
        notes={job.notes}
        signature={job.signature}
        reportSlug={job.reportSlug}
        reportUrl={reportUrl}
      />
    </div>
  );
}

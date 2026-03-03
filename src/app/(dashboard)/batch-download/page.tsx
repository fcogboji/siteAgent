import Link from "next/link";
import { redirect } from "next/navigation";
import { getEffectiveUserIdForJobs } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BatchDownloadClient } from "./batch-download-client";

export default async function BatchDownloadPage() {
  const userId = await getEffectiveUserIdForJobs();
  if (!userId) redirect("/sign-in");

  const jobs = await prisma.job.findMany({
    where: { userId, reportSlug: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, reportSlug: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-700 active:bg-stone-300"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-stone-900">Batch download reports</h1>
      </div>
      <p className="text-sm text-stone-600">
        Select jobs with reports and download their PDFs. You can download one or open multiple links.
      </p>
      <BatchDownloadClient jobs={jobs} />
    </div>
  );
}

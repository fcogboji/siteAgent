import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserIdForJobs } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { LandingView } from "@/components/landing-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <>
      <SignedOut>
        <LandingView />
      </SignedOut>
      <SignedIn>
        <JobsList />
      </SignedIn>
    </>
  );
}

async function JobsList() {
  const userId = await getEffectiveUserIdForJobs();
  if (!userId) return null;

  const jobs = await prisma.job.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-0 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-stone-900">My jobs</h1>
        <div className="flex gap-2">
          <Link
            href="/batch-download"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 sm:min-h-0"
          >
            Batch download
          </Link>
          <Link
            href="/jobs/new"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-semibold text-white shadow-sm hover:bg-primary-hover sm:w-auto"
          >
            New job
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-stone-600">No jobs yet.</p>
          <Link
            href="/jobs/new"
            className="mt-4 inline-block font-medium text-primary hover:text-primary-hover"
          >
            Create your first job →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/jobs/${job.id}`}
                className="block min-h-[44px] rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow active:bg-stone-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-stone-900">{job.title}</span>
                  <span className="text-sm text-stone-500">
                    {job._count.photos} photo{job._count.photos !== 1 ? "s" : ""}
                  </span>
                </div>
                {job.clientName && (
                  <p className="mt-1 text-sm text-stone-600">{job.clientName}</p>
                )}
                <p className="mt-1 text-xs text-stone-400">
                  {formatDistanceToNow(job.updatedAt, { addSuffix: true })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

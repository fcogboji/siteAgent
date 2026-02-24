import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <>
      <SignedOut>
        <Landing />
      </SignedOut>
      <SignedIn>
        <JobsList />
      </SignedIn>
    </>
  );
}

function Landing() {
  return (
    <>
      <div className="mx-auto max-w-2xl space-y-10 py-8 sm:max-w-4xl">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Never lose money to job disputes again.
          </h1>
          <p className="mt-3 text-stone-600">
            Take timestamped photos, capture signatures, and generate a professional evidence report in seconds.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Start 7-day free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-300 bg-white px-6 text-base font-semibold text-stone-700 hover:bg-stone-50"
            >
              View pricing
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-base font-medium text-stone-600 hover:text-stone-900"
            >
              Sign in
            </Link>
          </div>
        </section>
        {/* Pain */}
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-800">Why trades lose money</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-stone-600">
            <li>Clients deny extra work</li>
            <li>Property damage claims</li>
            <li>Verbal agreements disappear</li>
            <li>Snag disputes delay payment</li>
            <li>No written proof of completion</li>
          </ul>
        </section>
        {/* How it works */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Step num={1} title="Capture evidence" desc="Photos stamped with time & location" />
          <Step num={2} title="Get sign-off" desc="Client signs on your phone" />
          <Step num={3} title="Generate report" desc="Share a professional proof document" />
        </section>
        {/* CTA */}
        <section className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-6 text-center">
          <h2 className="font-bold text-stone-900">7-day free trial</h2>
          <p className="mt-2 text-sm text-stone-600">
            Card required. We charge automatically after 7 days. Cancel anytime.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-block font-semibold text-amber-700 hover:text-amber-800"
          >
            Get started →
          </Link>
        </section>
      </div>
      <Footer />
    </>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
        {num}
      </span>
      <h3 className="mt-2 font-semibold text-stone-800">{title}</h3>
      <p className="mt-1 text-sm text-stone-600">{desc}</p>
    </div>
  );
}

async function JobsList() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const jobs = await prisma.job.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">My jobs</h1>
        <Link
          href="/jobs/new"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          New job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-stone-600">No jobs yet.</p>
          <Link
            href="/jobs/new"
            className="mt-4 inline-block font-medium text-amber-600 hover:text-amber-700"
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
                className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow"
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

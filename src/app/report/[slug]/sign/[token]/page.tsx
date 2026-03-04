import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ClientSignForm } from "./client-sign-form";

export default async function ReportSignPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;

  const job = await prisma.job.findFirst({
    where: { reportSlug: slug, clientSignToken: token },
    include: { photos: { orderBy: { createdAt: "asc" } }, signature: true },
  });

  if (!job) notFound();
  if (job.clientSignedAt) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center">
          <h1 className="text-lg font-bold text-stone-900">Already signed</h1>
          <p className="mt-2 text-stone-600">This report has already been signed.</p>
          <Link
            href={`/report/${slug}`}
            className="mt-6 inline-block font-medium text-primary hover:underline"
          >
            View report →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-2xl bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8">
        <header className="border-b border-stone-200 pb-6">
          <h1 className="text-xl font-bold text-stone-900">Review & sign report</h1>
          <p className="mt-1 text-sm text-stone-500">
            Please review the report below and sign to confirm.
          </p>
        </header>

        <dl className="mt-6 grid gap-2 border-b border-stone-200 pb-6">
          <dt className="text-stone-500">Job</dt>
          <dd className="font-medium text-stone-900">{job.title}</dd>
          {job.clientName && (
            <>
              <dt className="text-stone-500">Client</dt>
              <dd className="text-stone-700">{job.clientName}</dd>
            </>
          )}
          <dt className="text-stone-500">Date</dt>
          <dd className="text-stone-700">{format(job.updatedAt, "d MMMM yyyy, HH:mm")}</dd>
        </dl>

        {job.notes && (
          <section className="border-b border-stone-200 py-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-stone-700">{job.notes}</p>
          </section>
        )}

        {job.photos.length > 0 && (
          <section className="border-b border-stone-200 py-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Photos ({job.photos.length})
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {job.photos.map((p) => (
                <li key={p.id} className="relative aspect-square overflow-hidden rounded-lg border border-stone-200">
                  {p.imageUrl.startsWith("data:") ? (
                    <img
                      src={p.imageUrl}
                      alt={p.note || "Photo"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={p.imageUrl}
                      alt={p.note || "Photo"}
                      fill
                      className="object-cover"
                      unoptimized={p.imageUrl.startsWith("http")}
                    />
                  )}
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white">
                    {format(new Date(p.createdAt), "d MMM HH:mm")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <ClientSignForm signToken={token} reportSlug={slug} />
        </section>

        <footer className="mt-8 border-t border-stone-200 pt-6 text-center text-sm text-stone-500">
          <Link href="/" className="font-medium text-primary hover:underline">
            Site Agent
          </Link>
        </footer>
      </div>
    </div>
  );
}

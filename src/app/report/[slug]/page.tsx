import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await prisma.job.findUnique({
    where: { reportSlug: slug },
    include: { photos: { orderBy: { createdAt: "asc" } }, signature: true },
  });
  if (!job) notFound();

  return (
    <div className="min-h-screen bg-stone-100 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-2xl bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8">
        <header className="border-b border-stone-200 pb-6">
          <h1 className="text-xl font-bold text-stone-900">Proof of work report</h1>
          <p className="mt-1 text-sm text-stone-500">
            Generated with{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              Site Agent
            </Link>
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
          {job.address && (
            <>
              <dt className="text-stone-500">Address</dt>
              <dd className="text-stone-700">{job.address}</dd>
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
          <>
            {(["condition", "before", "after", null] as const).map((tag) => {
              const group = job.photos.filter((p) => (p.tag ?? null) === tag);
              if (group.length === 0) return null;
              const title =
                tag === "condition"
                  ? "Condition on arrival (damage protection)"
                  : tag === "before"
                    ? "Before"
                    : tag === "after"
                      ? "After"
                      : "Photos";
              return (
                <section key={tag ?? "other"} className="border-b border-stone-200 py-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                    {title} ({group.length})
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {group.map((p) => (
                      <li key={p.id}>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-stone-200">
                          {p.imageUrl.startsWith("data:") ? (
                            <img
                              src={p.imageUrl}
                              alt={p.note || "Job photo"}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Image
                              src={p.imageUrl}
                              alt={p.note || "Job photo"}
                              fill
                              className="object-contain"
                              unoptimized={p.imageUrl.startsWith("http")}
                            />
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-stone-500">
                          <span>{format(new Date(p.createdAt), "d MMM yyyy, HH:mm")}</span>
                          {p.note && <span>{p.note}</span>}
                        </div>
                        {p.latitude != null && p.longitude != null && (
                          <p className="mt-1 text-xs text-stone-500">
                            Location:{" "}
                            <a
                              href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)} — View on map
                            </a>
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </>
        )}

        {job.signature && (
          <section className="py-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Signature
            </h2>
            <div className="mt-2 flex items-center gap-4">
              <img
                src={job.signature.signatureImageUrl}
                alt="Signature"
                className="max-h-20 w-auto border-b-2 border-stone-400"
              />
              {job.signature.signedBy && (
                <span className="text-stone-600">— {job.signature.signedBy}</span>
              )}
            </div>
          </section>
        )}

        <footer className="mt-8 border-t border-stone-200 pt-6 text-center text-sm text-stone-500">
          This report was generated by Site Agent. Proof your work. Prevent disputes. Get paid.
        </footer>
      </div>
    </div>
  );
}

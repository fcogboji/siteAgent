"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";

type Photo = {
  id: string;
  imageUrl: string;
  note: string | null;
  tag: string | null;
  createdAt: Date | string;
  latitude: number | null;
  longitude: number | null;
};

export function ReportPhotosLightbox({ photos }: { photos: Photo[] }) {
  const flatPhotos = photos.map((p) => ({
    ...p,
    createdAt: typeof p.createdAt === "string" ? new Date(p.createdAt) : p.createdAt,
  }));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const openFromHash = () => {
      const match = window.location.hash.match(/^#photo-(\d+)$/);
      if (!match) return;
      const i = parseInt(match[1], 10);
      if (i >= 0 && i < flatPhotos.length) setLightboxIndex(i);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [flatPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && flatPhotos.length > 0) {
        setLightboxIndex((i) => (i === null ? null : (i - 1 + flatPhotos.length) % flatPhotos.length));
      }
      if (e.key === "ArrowRight" && flatPhotos.length > 0) {
        setLightboxIndex((i) => (i === null ? null : (i + 1) % flatPhotos.length));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, flatPhotos.length]);

  if (flatPhotos.length === 0) return null;

  return (
    <>
      {(["condition", "before", "after", null] as const).map((tag) => {
        const group = flatPhotos.filter((p) => (p.tag ?? null) === tag);
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
              {group.map((p) => {
                const indexInFlat = flatPhotos.findIndex((x) => x.id === p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(indexInFlat)}
                      className="relative aspect-video w-full overflow-hidden rounded-lg border border-stone-200 text-left focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="View photo full screen"
                    >
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
                    </button>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-stone-500">
                      <span>{format(p.createdAt, "d MMM yyyy, HH:mm")}</span>
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
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)} — View on map
                        </a>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {/* Full-screen lightbox */}
      {lightboxIndex !== null && flatPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo full screen"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {flatPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i === null ? 0 : (i - 1 + flatPhotos.length) % flatPhotos.length));
                }}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:left-4"
                aria-label="Previous photo"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i === null ? 0 : (i + 1) % flatPhotos.length));
                }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:right-4"
                aria-label="Next photo"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={flatPhotos[lightboxIndex].imageUrl}
              alt={flatPhotos[lightboxIndex].note || "Job photo"}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded bg-black/60 px-3 py-1.5 text-sm text-white">
            {format(flatPhotos[lightboxIndex].createdAt, "d MMM yyyy, HH:mm")}
            {flatPhotos[lightboxIndex].tag && ` · ${flatPhotos[lightboxIndex].tag}`}
          </p>
        </div>
      )}
    </>
  );
}

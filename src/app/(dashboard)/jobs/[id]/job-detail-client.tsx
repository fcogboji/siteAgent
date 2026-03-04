"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, useEffect } from "react";
import { addPhotoToJob, updateJobNotes, saveSignature, generateReportSlug, updatePhotoTag, type PhotoTag } from "@/app/actions/jobs";
import { uploadPhoto } from "@/app/actions/upload";
import { compressImageIfNeeded } from "@/lib/compress-image";
import { SignaturePad } from "./signature-pad";
import { VoiceNoteButton } from "./voice-note-button";
import type { Photo, Signature } from "@prisma/client";
import { format } from "date-fns";

type PhotoWithTag = Photo & { createdAt: Date; tag: string | null; latitude: number | null; longitude: number | null };
type Props = {
  jobId: string;
  jobTitle: string;
  clientName: string | null;
  address: string | null;
  photos: PhotoWithTag[];
  notes: string | null;
  signature: Signature | null;
  reportSlug: string | null;
  reportUrl: string | null;
  clientSignToken: string | null;
  clientSignedAt: Date | null;
};

export function JobDetailClient({
  jobId,
  jobTitle,
  clientName,
  address,
  photos,
  notes,
  signature,
  reportSlug,
  reportUrl,
  clientSignToken,
  clientSignedAt,
}: Props) {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const locationPromiseRef = useRef<Promise<{ latitude: number; longitude: number } | null> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<"preparing" | "uploading">("uploading");
  const [noteDraft, setNoteDraft] = useState(notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [newReportSlug, setNewReportSlug] = useState<string | null>(reportSlug);
  const [newReportUrl, setNewReportUrl] = useState<string | null>(reportUrl);
  const [photoTag, setPhotoTag] = useState<"before" | "after" | "condition" | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && photos.length > 0) {
        setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
      }
      if (e.key === "ArrowRight" && photos.length > 0) {
        setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, photos.length]);

  function getLocationOnce(): Promise<{ latitude: number; longitude: number } | null> {
    if (!navigator.geolocation) return Promise.resolve(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 }
      );
    });
  }

  async function getLocation(): Promise<{ latitude: number; longitude: number } | null> {
    const first = await getLocationOnce();
    if (first) return first;
    await new Promise((r) => setTimeout(r, 1500));
    return getLocationOnce();
  }

  function startLocationCapture() {
    if (!locationPromiseRef.current) {
      locationPromiseRef.current = getLocation();
    }
  }

  const UPLOAD_TIMEOUT_MS = 60_000; // 60s; compression keeps files small so this is a safety net

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>, fromCamera: boolean) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    setUploadPhase("preparing");
    try {
      const doUpload = async () => {
        const pendingLocation = locationPromiseRef.current;
        locationPromiseRef.current = null;
        const locationPromise = pendingLocation ?? getLocation();
        const [location, compressed] = await Promise.all([
          locationPromise,
          compressImageIfNeeded(file),
        ]);
        setUploadPhase("uploading");
        const fd = new FormData();
        const blobOrFile = compressed instanceof Blob ? new File([compressed], file.name, { type: "image/jpeg" }) : compressed;
        fd.set("file", blobOrFile);
        fd.set("jobId", jobId);
        const result = await uploadPhoto(fd);
        if (result.error) {
          throw new Error(result.error);
        }
        if (result.url) {
          await addPhotoToJob(
            jobId,
            result.url,
            undefined,
            photoTag,
            location?.latitude ?? null,
            location?.longitude ?? null
          );
          if (location == null) {
            alert("Photo added. To capture location on future photos: turn on Location in your device settings and choose \"Allow\" when the browser asks for this site.");
          }
          router.refresh();
        }
      };
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), UPLOAD_TIMEOUT_MS)
      );
      await Promise.race([doUpload(), timeout]);
    } catch (err) {
      const message =
        err instanceof Error && err.message === "TIMEOUT"
          ? "Upload timed out. Check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Upload failed. Please try again.";
      alert(message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    await updateJobNotes(jobId, noteDraft);
    setSavingNotes(false);
    router.refresh();
  }

  async function handleGenerateReport() {
    setReportGenerating(true);
    const slug = await generateReportSlug(jobId);
    if (slug) {
      setNewReportSlug(slug);
      const base = typeof window !== "undefined" ? window.location.origin : "";
      setNewReportUrl(`${base}/report/${slug}`);
      router.refresh();
    }
    setReportGenerating(false);
  }

  const reportLink = newReportUrl ?? reportUrl;

function ShareReportButton({ reportUrl, jobTitle }: { reportUrl: string; jobTitle: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: "Proof of work report",
      text: `Report: ${jobTitle}. View at ${reportUrl}`,
      url: reportUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="min-h-[48px] flex-1 rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 sm:p-3"
    >
      {copied ? "Link copied!" : "Share (SMS/WhatsApp)"}
    </button>
  );
}

function ClientSignLink({ reportSlug, clientSignToken }: { reportSlug: string; clientSignToken: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const signUrl = `${baseUrl}/report/${reportSlug}/sign/${clientSignToken}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(signUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    const shareData = { title: "Sign this report", text: "Please review and sign this report", url: signUrl };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await handleCopy();
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-medium text-stone-600">Client sign link (send to client to sign — no login)</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="min-h-[44px] flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          {copied ? "Copied!" : "Copy sign link"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="min-h-[44px] flex-1 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
        >
          Share link
        </button>
      </div>
    </div>
  );
}

function PhotoTagSelect({
  jobId,
  photoId,
  currentTag,
  onUpdate,
}: {
  jobId: string;
  photoId: string;
  currentTag: PhotoTag;
  onUpdate: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const options: { value: PhotoTag; label: string }[] = [
    { value: null, label: "—" },
    { value: "condition", label: "Condition" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
  ];
  return (
    <select
      value={currentTag ?? ""}
      onChange={async (e) => {
        const v = e.target.value;
        const tag: PhotoTag = v === "before" || v === "after" || v === "condition" ? v : null;
        setUpdating(true);
        await updatePhotoTag(jobId, photoId, tag);
        setUpdating(false);
        onUpdate();
      }}
      disabled={updating}
      className="absolute right-1 top-1 min-h-[36px] min-w-[90px] rounded-lg border-0 bg-black/70 px-2 py-1.5 text-xs font-medium text-white focus:ring-2 focus:ring-primary/50"
    >
      {options.map((o) => (
        <option key={o.value ?? ""} value={o.value ?? ""}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

  return (
    <div className="space-y-8">
      {/* Photos */}
      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-stone-800">Photos</h2>
        <p className="mb-2 text-xs text-stone-400">
          Location is captured when you add a photo — allow location when your browser asks, and turn on Location in device settings if it’s not showing.
        </p>
        <p className="mb-3 text-sm text-stone-500">
          Tag next photo:{" "}
          <span className="mt-2 inline-flex flex-wrap gap-2">
            {(["condition", "before", "after", null] as const).map((t) => (
              <button
                key={t ?? "none"}
                type="button"
                onClick={() => setPhotoTag(t)}
                className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition active:scale-[0.98] ${
                  photoTag === t
                    ? "bg-primary text-white"
                    : "bg-stone-200 text-stone-600 hover:bg-stone-300 active:bg-stone-400"
                }`}
              >
                {t === "condition"
                  ? "Condition"
                  : t === "before"
                    ? "Before"
                    : t === "after"
                      ? "After"
                      : "None"}
              </button>
            ))}
          </span>
        </p>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePhotoChange(e, true)}
          disabled={uploading}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoChange(e, false)}
          disabled={uploading}
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              startLocationCapture();
              cameraInputRef.current?.click();
            }}
            disabled={uploading}
            className="flex min-h-[88px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-600 transition hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] active:border-primary/40 disabled:opacity-70 sm:min-h-[80px]"
          >
            {uploading ? (
              <span className="text-sm">{uploadPhase === "preparing" ? "Preparing…" : "Uploading…"}</span>
            ) : (
              <>
                <span className="text-2xl sm:text-xl">📷</span>
                <span className="mt-2 text-sm font-medium sm:text-xs">Take photo</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              startLocationCapture();
              galleryInputRef.current?.click();
            }}
            disabled={uploading}
            className="flex min-h-[88px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-600 transition hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] active:border-primary/40 disabled:opacity-70 sm:min-h-[80px]"
          >
            <span className="text-2xl sm:text-xl">🖼️</span>
            <span className="mt-2 text-sm font-medium sm:text-xs">From gallery</span>
          </button>
        </div>
        {photos.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p, index) => (
              <li key={p.id} className="relative aspect-square overflow-hidden rounded-lg border border-stone-200">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="absolute inset-0 z-0 block h-full w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                  aria-label="View photo full screen"
                >
                  {p.imageUrl.startsWith("data:") ? (
                    <img
                      src={p.imageUrl}
                      alt={p.note || "Job photo"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={p.imageUrl}
                      alt={p.note || "Job photo"}
                      fill
                      className="object-cover"
                      unoptimized={p.imageUrl.startsWith("http")}
                    />
                  )}
                </button>
                <span className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 px-2 py-1 text-xs text-white pointer-events-none">
                  {format(new Date(p.createdAt), "d MMM HH:mm")}
                </span>
                <span className="absolute left-1 top-1 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white pointer-events-none">
                  {p.tag === "condition"
                    ? "Condition"
                    : p.tag === "before"
                      ? "Before"
                      : p.tag === "after"
                        ? "After"
                        : "—"}
                </span>
                <div className="absolute right-1 top-1 z-20" onClick={(e) => e.stopPropagation()}>
                  <PhotoTagSelect
                    jobId={jobId}
                    photoId={p.id}
                    currentTag={p.tag as PhotoTag}
                    onUpdate={() => router.refresh()}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Full-screen lightbox */}
        {lightboxIndex !== null && photos[lightboxIndex] && (
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
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + photos.length) % photos.length));
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
                    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % photos.length));
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
            <div
              className="relative max-h-full max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[lightboxIndex].imageUrl}
                alt={photos[lightboxIndex].note || "Job photo"}
                className="max-h-[90vh] max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded bg-black/60 px-3 py-1.5 text-sm text-white">
              {format(new Date(photos[lightboxIndex].createdAt), "d MMM yyyy, HH:mm")}
              {photos[lightboxIndex].tag && ` · ${photos[lightboxIndex].tag}`}
            </p>
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-stone-800">Notes</h2>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={handleSaveNotes}
          placeholder="e.g. Wall cracked before work started"
          rows={4}
          className="w-full rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <VoiceNoteButton
            onTranscript={(text) => {
              const next = noteDraft ? `${noteDraft}\n${text}` : text;
              setNoteDraft(next);
              setSavingNotes(true);
              updateJobNotes(jobId, next).then(() => {
                setSavingNotes(false);
                router.refresh();
              });
            }}
            disabled={savingNotes}
          />
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 hover:text-primary-hover active:bg-primary/10"
          >
            {savingNotes ? "Saving…" : "Save notes"}
          </button>
        </div>
      </section>

      {/* Signature */}
      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-stone-800">Client signature</h2>
        {signature ? (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <img
              src={signature.signatureImageUrl}
              alt="Signature"
              className="max-h-24 w-auto"
            />
            {signature.signedBy && (
              <p className="mt-2 text-sm text-stone-600">Signed by: {signature.signedBy}</p>
            )}
          </div>
        ) : (
          <SignaturePad jobId={jobId} onSaved={() => router.refresh()} />
        )}
      </section>

      {/* Generate report */}
      <section className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold text-stone-800">Report</h2>
        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={reportGenerating}
          className="w-full min-h-[48px] rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-sm hover:bg-primary-hover active:scale-[0.99] disabled:opacity-70 sm:py-3"
        >
          {reportGenerating ? "Generating…" : "Generate report"}
        </button>
        {reportLink && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <ShareReportButton reportUrl={reportLink} jobTitle={jobTitle} />
              <Link
                href={reportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-h-[48px] flex-1 rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm font-medium text-primary hover:bg-primary/5 active:bg-primary/10 sm:p-3"
              >
                Open report →
              </Link>
              <a
                href={`/api/report/${newReportSlug ?? reportSlug}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-h-[48px] flex-1 rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 sm:p-3"
              >
                Download PDF
              </a>
            </div>
            {clientSignToken && reportSlug && !clientSignedAt && (
              <ClientSignLink reportSlug={newReportSlug ?? reportSlug} clientSignToken={clientSignToken} />
            )}
            {clientSignedAt && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                ✓ Client signed on {format(new Date(clientSignedAt), "d MMM yyyy, HH:mm")}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

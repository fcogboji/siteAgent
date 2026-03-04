"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  signToken: string;
  reportSlug: string;
};

export function ClientSignForm({ signToken, reportSlug }: Props) {
  const router = useRouter();
  const padRef = useRef<SignatureCanvas>(null);
  const [signedBy, setSignedBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const canvas = padRef.current?.getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl || dataUrl.length < 100) {
      setError("Please sign in the box above first.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/report/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: signToken,
          signatureDataUrl: dataUrl,
          signedBy: signedBy.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      router.push(data.redirectUrl || `/report/${reportSlug}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    padRef.current?.clear();
    setError(null);
  }

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
      <h2 className="text-lg font-semibold text-stone-900">Sign to confirm</h2>
      <p className="text-sm text-stone-600">
        By signing below you confirm you have reviewed this report and the work described.
      </p>
      <div className="rounded-lg border-2 border-stone-300 bg-white">
        <SignatureCanvas
          ref={padRef}
          canvasProps={{
            className: "w-full h-40 touch-none sm:h-44",
            style: { touchAction: "none" },
          }}
          backgroundColor="rgb(255, 255, 255)"
          penColor="rgb(0, 0, 0)"
        />
      </div>
      <input
        type="text"
        placeholder="Your name (optional)"
        value={signedBy}
        onChange={(e) => setSignedBy(e.target.value)}
        className="w-full min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400"
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="min-h-[48px] flex-1 rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="min-h-[48px] flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-70"
        >
          {saving ? "Saving…" : "Sign & confirm"}
        </button>
      </div>
    </div>
  );
}

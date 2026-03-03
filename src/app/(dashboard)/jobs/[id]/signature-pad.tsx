"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { saveSignature } from "@/app/actions/jobs";

export function SignaturePad({ jobId, onSaved }: { jobId: string; onSaved: () => void }) {
  const padRef = useRef<SignatureCanvas>(null);
  const [signedBy, setSignedBy] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const canvas = padRef.current?.getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl || dataUrl.length < 100) {
      alert("Please sign first.");
      return;
    }
    setSaving(true);
    await saveSignature(jobId, dataUrl, signedBy.trim() || undefined);
    setSaving(false);
    onSaved();
  }

  function handleClear() {
    padRef.current?.clear();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-stone-300 bg-white">
        <SignatureCanvas
          ref={padRef}
          canvasProps={{
            className: "w-full h-48 touch-none sm:h-44",
            style: { touchAction: "none" },
          }}
          backgroundColor="rgb(255, 255, 255)"
          penColor="rgb(0, 0, 0)"
        />
      </div>
      <input
        type="text"
        placeholder="Name of signatory (optional)"
        value={signedBy}
        onChange={(e) => setSignedBy(e.target.value)}
        className="w-full min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="min-h-[48px] flex-1 rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="min-h-[48px] flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover active:scale-[0.99] disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save signature"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { showToast } from "@/components/toast";

export function InviteCopyButton({ url }: { url: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(url);
    showToast("Link copied!");
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
    >
      Copy invite link
    </button>
  );
}

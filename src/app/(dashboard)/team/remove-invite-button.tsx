"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm("Remove this invite? They won’t be able to use the link anymore.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/team/remove-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      if (res.ok) router.refresh();
      else alert((await res.json()).error || "Failed to remove invite");
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-70"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}

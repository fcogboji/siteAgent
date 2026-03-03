"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveMemberButton({
  membershipId,
  currentUserId,
}: {
  membershipId: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm("Remove this member from the team? They will lose access to team jobs.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/team/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId }),
      });
      if (res.ok) router.refresh();
      else alert((await res.json()).error || "Failed to remove");
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
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-70"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}

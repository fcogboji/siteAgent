"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoleToggleButton({
  membershipId,
  currentRole,
  isOwner,
}: {
  membershipId: string;
  currentRole: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOwner) return null;

  const nextRole = currentRole === "admin" ? "member" : "admin";

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/team/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId, role: nextRole }),
      });
      if (res.ok) router.refresh();
      else alert((await res.json()).error || "Failed to update");
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-primary hover:underline disabled:opacity-70"
    >
      {loading ? "…" : `Make ${nextRole}`}
    </button>
  );
}

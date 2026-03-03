"use client";

import { useState } from "react";
import { showToast } from "@/components/toast";

export function TeamInviteForm({ teamId }: { teamId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInviteLink(null);
    setEmailSent(false);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create invite");
        return;
      }
      setInviteLink(data.inviteUrl || "");
      setEmailSent(!!data.emailSent);
      setEmail("");
      showToast(data.emailSent ? "Invite sent! They'll receive an email." : "Invite link ready! Copy and share it below.");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="invite-email" className="sr-only">
          Email address
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@example.com"
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
      >
        {loading ? "Sending…" : "Send invite"}
      </button>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      {inviteLink && (
        <div className="mt-2 flex flex-col gap-2 rounded-lg bg-stone-50 p-3 text-sm sm:col-span-2">
          {emailSent ? (
            <p className="font-medium text-green-700">Invite sent to their email. They can also use the link below if needed.</p>
          ) : (
            <p className="font-medium text-stone-800">Copy and share this link with them (add RESEND_API_KEY to .env to send invites by email).</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 rounded border border-stone-200 bg-white px-3 py-2 text-stone-600"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                showToast("Link copied!");
              }}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 hover:bg-stone-50"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

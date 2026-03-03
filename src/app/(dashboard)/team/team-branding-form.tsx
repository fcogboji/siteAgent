"use client";

import { useState } from "react";
import { updateTeamBranding } from "@/app/actions/team";
import { showToast } from "@/components/toast";

type Props = {
  teamId: string;
  initialName: string | null;
  initialLogoUrl: string | null;
  initialCompanyContact: string | null;
};

export function TeamBrandingForm({
  teamId,
  initialName,
  initialLogoUrl,
  initialCompanyContact,
}: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [companyContact, setCompanyContact] = useState(initialCompanyContact ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await updateTeamBranding(teamId, {
      name: name.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      companyContact: companyContact.trim() || undefined,
    });
    setLoading(false);
    if (res.error) {
      showToast(res.error);
      return;
    }
    showToast("Branding saved");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="brand-name" className="block text-sm font-medium text-stone-700">
          Company name
        </label>
        <input
          id="brand-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Builders"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="brand-logo" className="block text-sm font-medium text-stone-700">
          Logo URL
        </label>
        <input
          id="brand-logo"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 block w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-stone-500">Public URL to your logo image. Used on report PDFs.</p>
      </div>
      <div>
        <label htmlFor="brand-contact" className="block text-sm font-medium text-stone-700">
          Contact (phone/email)
        </label>
        <input
          id="brand-contact"
          type="text"
          value={companyContact}
          onChange={(e) => setCompanyContact(e.target.value)}
          placeholder="e.g. 0800 123 456"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-4 py-2 text-stone-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
      >
        {loading ? "Saving…" : "Save branding"}
      </button>
    </form>
  );
}

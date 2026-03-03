"use client";

import { useState } from "react";
import { createTemplate } from "@/app/actions/templates";
import { showToast } from "@/components/toast";

export function CreateTemplateForm() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [defaultNotes, setDefaultNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;
    setLoading(true);
    const res = await createTemplate(
      {
        name: name.trim(),
        title: title.trim(),
        clientName: clientName.trim() || null,
        address: address.trim() || null,
        defaultNotes: defaultNotes.trim() || null,
      },
      null
    );
    setLoading(false);
    if (res.error) {
      showToast(res.error);
      return;
    }
    showToast("Template saved");
    setName("");
    setTitle("");
    setClientName("");
    setAddress("");
    setDefaultNotes("");
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="tpl-name" className="block text-sm font-medium text-stone-700">
          Template name *
        </label>
        <input
          id="tpl-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Standard kitchen job"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="tpl-title" className="block text-sm font-medium text-stone-700">
          Default job title *
        </label>
        <input
          id="tpl-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Kitchen refurb"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="tpl-client" className="block text-sm font-medium text-stone-700">
          Default client
        </label>
        <input
          id="tpl-client"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Optional"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="tpl-address" className="block text-sm font-medium text-stone-700">
          Default address
        </label>
        <input
          id="tpl-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Optional"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="tpl-notes" className="block text-sm font-medium text-stone-700">
          Default notes
        </label>
        <textarea
          id="tpl-notes"
          value={defaultNotes}
          onChange={(e) => setDefaultNotes(e.target.value)}
          rows={2}
          placeholder="Optional"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70 sm:w-auto"
      >
        {loading ? "Saving…" : "Save template"}
      </button>
    </form>
  );
}

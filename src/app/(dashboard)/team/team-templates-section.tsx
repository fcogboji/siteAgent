"use client";

import { useState } from "react";
import { createTemplate, deleteTemplate } from "@/app/actions/templates";
import { showToast } from "@/components/toast";

type Template = { id: string; name: string; title: string };

type Props = {
  teamId: string;
  templates: Template[];
};

export function TeamTemplatesSection({ teamId, templates: initialTemplates }: Props) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;
    setLoading(true);
    const res = await createTemplate({ name: name.trim(), title: title.trim() }, teamId);
    setLoading(false);
    if (res.error) {
      showToast(res.error);
      return;
    }
    setTemplates((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), title: title.trim() }]);
    setName("");
    setTitle("");
    showToast("Template created");
    window.location.reload(); // refresh to get real id
  }

  async function handleDelete(id: string) {
    const res = await deleteTemplate(id);
    if (res.error) showToast(res.error);
    else {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showToast("Template deleted");
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="font-semibold text-stone-900">Team templates</h2>
      <p className="mt-1 text-sm text-stone-500">
        Create job templates shared with all team members. They can start new jobs from these.
      </p>
      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name"
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Default job title"
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
        >
          Add template
        </button>
      </form>
      {templates.length > 0 && (
        <ul className="mt-4 space-y-2">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2">
              <span className="font-medium text-stone-900">{t.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

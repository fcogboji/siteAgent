"use client";

import { useActionState, useState } from "react";
import { createJob } from "@/app/actions/jobs";

const initialState = { error: null as string | null };

type Template = {
  id: string;
  name: string;
  title: string;
  clientName: string | null;
  address: string | null;
  defaultNotes: string | null;
  scope: "personal" | "team";
};

export function CreateJobForm({ templates }: { templates: Template[] }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await createJob(formData);
      if (result && "error" in result) return { error: result.error };
      return initialState;
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      {state?.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}
      {templates.length > 0 && (
        <div>
          <label htmlFor="templateId" className="block text-sm font-medium text-stone-700">
            Start from template (optional)
          </label>
          <select
            id="templateId"
            name="templateId"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="mt-2 block w-full min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">No template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.scope === "team" ? "(team)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700">
          Job title *
        </label>
        <input
          key={`title-${selectedTemplateId}`}
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Kitchen refurb, 12 Acacia Rd"
          defaultValue={selectedTemplate?.title}
          className="mt-2 block w-full min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-stone-700">
          Client name
        </label>
        <input
          key={`client-${selectedTemplateId}`}
          id="clientName"
          name="clientName"
          type="text"
          placeholder="e.g. John Smith"
          defaultValue={selectedTemplate?.clientName ?? ""}
          className="mt-2 block w-full min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-stone-700">
          Default notes
        </label>
        <textarea
          key={`notes-${selectedTemplateId}`}
          id="notes"
          name="notes"
          rows={3}
          placeholder="e.g. Wall cracked before work started"
          defaultValue={selectedTemplate?.defaultNotes ?? ""}
          className="mt-2 block w-full min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-stone-700">
          Address
        </label>
        <input
          key={`address-${selectedTemplateId}`}
          id="address"
          name="address"
          type="text"
          placeholder="Site address"
          defaultValue={selectedTemplate?.address ?? ""}
          className="mt-2 block w-full min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <button
        type="submit"
        className="w-full min-h-[48px] rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-sm hover:bg-primary-hover active:scale-[0.99] sm:py-3"
      >
        Create job
      </button>
    </form>
  );
}

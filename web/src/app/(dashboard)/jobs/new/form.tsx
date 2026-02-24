"use client";

import { useActionState } from "react";
import { createJob } from "@/app/actions/jobs";

const initialState = { error: null as string | null };

export function CreateJobForm() {
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
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700">
          Job title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Kitchen refurb, 12 Acacia Rd"
          className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-stone-700">
          Client name
        </label>
        <input
          id="clientName"
          name="clientName"
          type="text"
          placeholder="e.g. John Smith"
          className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-stone-700">
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          placeholder="Site address"
          className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-amber-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-700"
      >
        Create job
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

type Job = { id: string; title: string; reportSlug: string | null };

export function BatchDownloadClient({ jobs }: { jobs: Job[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const withReports = jobs.filter((j) => j.reportSlug);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(withReports.map((j) => j.id)));
  }

  function handleDownloadAll() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const url = `/api/reports/batch-pdf?ids=${ids.join(",")}`;
    if (ids.length === 1) {
      window.location.href = url;
    } else {
      const base = window.location.origin;
      ids.forEach((id) => {
        const job = withReports.find((j) => j.id === id);
        if (job?.reportSlug) window.open(`${base}/api/report/${job.reportSlug}/pdf`);
      });
    }
  }

  if (withReports.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-stone-600">No jobs with reports yet. Generate reports from job detail pages first.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-primary hover:text-primary-hover">
          ← Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="min-h-[48px] rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 sm:py-2"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={handleDownloadAll}
          disabled={selected.size === 0}
          className="min-h-[48px] rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 sm:py-2"
        >
          Download selected ({selected.size})
        </button>
      </div>
      <ul className="space-y-2 rounded-xl border border-stone-200 bg-white p-4">
        {withReports.map((j) => (
          <li key={j.id} className="flex min-h-[56px] items-center gap-3 py-2">
            <input
              type="checkbox"
              id={j.id}
              checked={selected.has(j.id)}
              onChange={() => toggle(j.id)}
              className="h-5 w-5 shrink-0 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/30"
            />
            <label htmlFor={j.id} className="min-w-0 flex-1 cursor-pointer font-medium text-stone-900">
              {j.title}
            </label>
            <a
              href={`/api/report/${j.reportSlug}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 active:bg-primary/10"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

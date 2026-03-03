"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const ACTION_LABELS: Record<string, string> = {
  job_created: "created job",
  photo_added: "added a photo to",
  notes_updated: "updated notes on",
  signature_added: "captured signature on",
  report_generated: "generated report for",
};

type Activity = {
  id: string;
  action: string;
  createdAt: Date;
  actor: { id: string; name: string | null; email: string | null };
  job: { id: string; title: string };
};

type Person = { id: string; label: string };

export function TeamActivityFeed({
  activities,
  people,
}: {
  activities: Activity[];
  people: Person[];
}) {
  const [filterBy, setFilterBy] = useState<string>("all");
  const filtered =
    filterBy === "all"
      ? activities
      : activities.filter((a) => a.actor.id === filterBy);

  if (activities.length === 0) {
    return (
      <p className="rounded-xl border border-stone-200 bg-white px-4 py-6 text-center text-sm text-stone-500">
        No activity yet. When team members create jobs, add photos, or update notes, it will appear here.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-stone-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-stone-900">Recent activity</h3>
        {people.length > 1 && (
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All members</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <ul className="divide-y divide-stone-100">
        {filtered.map((a) => {
          const actorName = a.actor.name || a.actor.email || "Someone";
          const label = ACTION_LABELS[a.action] ?? a.action;
          const isJobAction = ["job_created", "photo_added", "notes_updated", "signature_added", "report_generated"].includes(a.action);
          return (
            <li key={a.id} className="px-4 py-3">
              <p className="text-sm text-stone-700">
                <span className="font-medium text-stone-900">{actorName}</span>{" "}
                {label}{" "}
                {isJobAction ? (
                  <Link
                    href={`/jobs/${a.job.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {a.job.title}
                  </Link>
                ) : (
                  a.job.title
                )}
              </p>
              <p className="mt-0.5 text-xs text-stone-400">
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

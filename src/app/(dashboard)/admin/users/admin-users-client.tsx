"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { adminBulkSuspend, adminBulkRestore } from "@/app/actions/admin";
import Link from "next/link";
import { AdminUserActions } from "./admin-user-actions";
import { formatDistanceToNow } from "date-fns";

function hasActiveSubscription(status: string | null): boolean {
  return status != null && ["active", "trialing"].includes(status);
}

type User = {
  id: string;
  email: string | null;
  name: string | null;
  suspended: boolean;
  isAdmin: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  createdAt: Date;
  _count: { jobs: number };
};

export function AdminUsersClient({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const q = searchParams.get("q") ?? "";

  const selectableUsers = users.filter((u) => u.id !== currentUserId && !u.isAdmin);
  const selectedIds = Array.from(selected).filter((id) =>
    selectableUsers.some((u) => u.id === id)
  );
  const allSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every((u) => selected.has(u.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(selectableUsers.map((u) => u.id)));
  }

  function setQuery(value: string) {
    const u = new URLSearchParams(searchParams);
    if (value) u.set("q", value);
    else u.delete("q");
    router.push(`/admin/users?${u.toString()}`);
  }

  async function runBulk(action: "suspend" | "restore") {
    if (selectedIds.length === 0) return;
    const msg =
      action === "suspend"
        ? `Suspend ${selectedIds.length} user(s)?`
        : `Restore ${selectedIds.length} user(s)?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      const fn = action === "suspend" ? adminBulkSuspend : adminBulkRestore;
      const r = await fn(selectedIds);
      if (r.error) alert(r.error);
      else {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  function exportCsv() {
    const headers = [
      "Email",
      "Name",
      "Plan",
      "Status",
      "Jobs",
      "Joined",
      "Suspended",
    ];
    const rows = users.map((u) => [
      u.email ?? "",
      u.name ?? "",
      u.stripeSubscriptionStatus ?? "—",
      u.suspended ? "Suspended" : "Active",
      String(u._count.jobs),
      u.createdAt.toISOString().slice(0, 10),
      u.suspended ? "Yes" : "No",
    ]);
    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).querySelector<HTMLInputElement>('input[name="q"]');
            setQuery(input?.value?.trim() ?? "");
          }}
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by email or name…"
            className="w-56 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Search
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => runBulk("suspend")}
                disabled={isPending}
                className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-800 hover:bg-orange-100 disabled:opacity-50"
              >
                {isPending ? "…" : `Suspend ${selectedIds.length}`}
              </button>
              <button
                type="button"
                onClick={() => runBulk("restore")}
                disabled={isPending}
                className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-50"
              >
                {isPending ? "…" : `Restore ${selectedIds.length}`}
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                Clear
              </button>
            </>
          )}
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white -mx-4 sm:mx-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="w-10 px-2 py-3 sm:px-4">
                {selectableUsers.length > 0 && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-stone-300"
                  />
                )}
              </th>
              <th className="px-2 py-3 font-semibold text-stone-700 sm:px-4">Email</th>
              <th className="px-2 py-3 font-semibold text-stone-700 sm:px-4">Status</th>
              <th className="px-2 py-3 font-semibold text-stone-700 sm:px-4">Jobs</th>
              <th className="px-2 py-3 font-semibold text-stone-700 sm:px-4">Joined</th>
              <th className="px-2 py-3 font-semibold text-stone-700 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-stone-100">
                <td className="px-2 py-3 sm:px-4">
                  {selectableUsers.some((x) => x.id === u.id) ? (
                    <input
                      type="checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className="rounded border-stone-300"
                    />
                  ) : null}
                </td>
                <td className="px-2 py-3 sm:px-4">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {u.email ?? "—"}
                  </Link>
                </td>
                <td className="px-2 py-3 sm:px-4">
                  <span
                    className={
                      u.suspended
                        ? "rounded bg-red-100 px-2 py-0.5 text-red-800"
                        : hasActiveSubscription(u.stripeSubscriptionStatus)
                          ? "rounded bg-green-100 px-2 py-0.5 text-green-800"
                          : "rounded bg-stone-100 px-2 py-0.5 text-stone-600"
                    }
                  >
                    {u.suspended ? "Suspended" : (u.stripeSubscriptionStatus ?? "No plan")}
                  </span>
                </td>
                <td className="px-2 py-3 text-stone-600 sm:px-4">{u._count.jobs}</td>
                <td className="px-2 py-3 text-stone-500 sm:px-4">
                  {formatDistanceToNow(u.createdAt, { addSuffix: true })}
                </td>
                <AdminUserActions
                  userId={u.id}
                  stripeCustomerId={u.stripeCustomerId}
                  stripeSubscriptionId={u.stripeSubscriptionId}
                  stripeSubscriptionStatus={u.stripeSubscriptionStatus}
                  isCurrentUser={currentUserId === u.id}
                  suspended={u.suspended}
                  isAdmin={u.isAdmin}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

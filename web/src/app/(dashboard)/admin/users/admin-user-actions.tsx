"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCancelSubscription,
  adminRestoreSubscription,
  adminDeleteUser,
} from "@/app/actions/admin";

type Props = {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  isCurrentUser: boolean;
};

export function AdminUserActions({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  stripeSubscriptionStatus,
  isCurrentUser,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const hasSub = stripeSubscriptionId && ["active", "trialing"].includes(stripeSubscriptionStatus ?? "");

  async function run(action: string, fn: () => Promise<{ ok?: boolean; error?: string }>) {
    setLoading(action);
    try {
      const r = await fn();
      if (r.error) alert(r.error);
      else router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <td className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {stripeCustomerId && (
          <a
            href={`https://dashboard.stripe.com/customers/${stripeCustomerId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            Stripe
          </a>
        )}
        {hasSub && (
          <>
            <button
              type="button"
              onClick={() => run("cancel", () => adminCancelSubscription(userId))}
              disabled={!!loading}
              className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              {loading === "cancel" ? "…" : "Cancel sub"}
            </button>
            <button
              type="button"
              onClick={() => run("restore", () => adminRestoreSubscription(userId))}
              disabled={!!loading}
              className="rounded border border-green-300 bg-green-50 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-100 disabled:opacity-50"
            >
              {loading === "restore" ? "…" : "Restore sub"}
            </button>
          </>
        )}
        {!isCurrentUser && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("Permanently delete this user and all their jobs?")) return;
              run("delete", () => adminDeleteUser(userId));
            }}
            disabled={!!loading}
            className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {loading === "delete" ? "…" : "Delete"}
          </button>
        )}
      </div>
    </td>
  );
}

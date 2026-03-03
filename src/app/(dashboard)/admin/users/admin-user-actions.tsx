"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCancelSubscription,
  adminRestoreSubscription,
  adminDeleteUser,
  adminSuspendUser,
  adminRestoreUser,
} from "@/app/actions/admin";

type Props = {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  isCurrentUser: boolean;
  suspended: boolean;
  isAdmin: boolean;
  variant?: "cell" | "block";
};

export function AdminUserActions({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  stripeSubscriptionStatus,
  isCurrentUser,
  suspended,
  isAdmin,
  variant = "cell",
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

  const content = (
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {stripeCustomerId && (
          <a
            href={`https://dashboard.stripe.com/customers/${stripeCustomerId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] min-w-[44px] rounded border border-stone-300 px-2 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 sm:min-h-0 sm:min-w-0"
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
              className="min-h-[44px] rounded border border-primary/40 bg-primary/10 px-2 py-2 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50 sm:min-h-0 sm:py-1"
            >
              {loading === "cancel" ? "…" : "Cancel sub"}
            </button>
            <button
              type="button"
              onClick={() => run("restore", () => adminRestoreSubscription(userId))}
              disabled={!!loading}
              className="min-h-[44px] rounded border border-green-300 bg-green-50 px-2 py-2 text-xs font-medium text-green-800 hover:bg-green-100 disabled:opacity-50 sm:min-h-0 sm:py-1"
            >
              {loading === "restore" ? "…" : "Restore sub"}
            </button>
          </>
        )}
        {!isCurrentUser && !isAdmin && (
          suspended ? (
            <button
              type="button"
              onClick={() => run("restoreUser", () => adminRestoreUser(userId))}
              disabled={!!loading}
              className="min-h-[44px] rounded border border-green-300 bg-green-50 px-2 py-2 text-xs font-medium text-green-800 hover:bg-green-100 disabled:opacity-50 sm:min-h-0 sm:py-1"
            >
              {loading === "restoreUser" ? "…" : "Restore user"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!confirm("Suspend this user? They won’t be able to use the app until you restore them.")) return;
                run("suspend", () => adminSuspendUser(userId));
              }}
              disabled={!!loading}
              className="min-h-[44px] rounded border border-orange-300 bg-orange-50 px-2 py-2 text-xs font-medium text-orange-800 hover:bg-orange-100 disabled:opacity-50 sm:min-h-0 sm:py-1"
            >
              {loading === "suspend" ? "…" : "Suspend"}
            </button>
          )
        )}
        {!isCurrentUser && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("Permanently delete this user and all their jobs?")) return;
              run("delete", () => adminDeleteUser(userId));
            }}
            disabled={!!loading}
            className="min-h-[44px] rounded border border-red-200 bg-red-50 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 sm:min-h-0 sm:py-1"
          >
            {loading === "delete" ? "…" : "Delete"}
          </button>
        )}
      </div>
  );
  return variant === "block" ? <div>{content}</div> : <td className="px-2 py-3 sm:px-4">{content}</td>;
}

import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { AdminUserActions } from "./admin-user-actions";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentUserId = await getCurrentUserId();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { jobs: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Users</h1>
      <p className="mt-1 text-stone-600">Manage users, subscriptions, and access.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-4 py-3 font-semibold text-stone-700">Email</th>
              <th className="px-4 py-3 font-semibold text-stone-700">Status</th>
              <th className="px-4 py-3 font-semibold text-stone-700">Jobs</th>
              <th className="px-4 py-3 font-semibold text-stone-700">Joined</th>
              <th className="px-4 py-3 font-semibold text-stone-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-stone-100">
                <td className="px-4 py-3 text-stone-900">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      hasActiveSubscription(u.stripeSubscriptionStatus)
                        ? "rounded bg-green-100 px-2 py-0.5 text-green-800"
                        : "rounded bg-stone-100 px-2 py-0.5 text-stone-600"
                    }
                  >
                    {u.stripeSubscriptionStatus ?? "No plan"}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">{u._count.jobs}</td>
                <td className="px-4 py-3 text-stone-500">
                  {formatDistanceToNow(u.createdAt, { addSuffix: true })}
                </td>
                <AdminUserActions
                  userId={u.id}
                  stripeCustomerId={u.stripeCustomerId}
                  stripeSubscriptionId={u.stripeSubscriptionId}
                  stripeSubscriptionStatus={u.stripeSubscriptionStatus}
                  isCurrentUser={currentUserId === u.id}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [
    userCount,
    jobCount,
    photoCount,
    subscribedCount,
    suspendedCount,
    recentUsers,
    recentJobs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.photo.count(),
    prisma.user.count({
      where: {
        stripeSubscriptionStatus: { in: ["active", "trialing"] },
        suspended: false,
      },
    }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { jobs: true } } },
    }),
    prisma.job.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { user: { select: { email: true } }, _count: { select: { photos: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Analytics</h1>
      <p className="mt-1 text-stone-600">Overview and recent activity.</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Key metrics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total users" value={userCount} />
          <StatCard label="Subscribed (active)" value={subscribedCount} />
          <StatCard label="Suspended" value={suspendedCount} className={suspendedCount > 0 ? "border-orange-200 bg-orange-50/50" : ""} />
          <StatCard label="Total jobs" value={jobCount} />
          <StatCard label="Total photos" value={photoCount} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Recent users</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white -mx-4 sm:mx-0">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-3 py-3 font-semibold text-stone-700">Email</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Status</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Jobs</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-stone-100">
                  <td className="px-3 py-2 text-stone-900">{u.email ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        u.suspended
                          ? "rounded bg-red-100 px-2 py-0.5 text-red-800"
                          : hasActiveSubscription(u.stripeSubscriptionStatus)
                            ? "rounded bg-green-100 px-2 py-0.5 text-green-800"
                            : "rounded bg-stone-100 px-2 py-0.5 text-stone-600"
                      }
                    >
                      {u.suspended ? "Suspended" : (u.stripeSubscriptionStatus ?? "—")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-stone-600">{u._count.jobs}</td>
                  <td className="px-3 py-2 text-stone-500">{formatDistanceToNow(u.createdAt, { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2">
          <Link href="/admin/users" className="text-sm font-medium text-primary hover:text-primary-hover">
            Manage all users →
          </Link>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Recent jobs</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white -mx-4 sm:mx-0">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-3 py-3 font-semibold text-stone-700">Job</th>
                <th className="px-3 py-3 font-semibold text-stone-700">User</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Photos</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((j) => (
                <tr key={j.id} className="border-b border-stone-100">
                  <td className="px-3 py-2 font-medium text-stone-900">{j.title}</td>
                  <td className="px-3 py-2 text-stone-600">{j.user.email ?? "—"}</td>
                  <td className="px-3 py-2 text-stone-600">{j._count.photos}</td>
                  <td className="px-3 py-2 text-stone-500">{formatDistanceToNow(j.updatedAt, { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-stone-200 bg-white p-4 ${className}`}>
      <dt className="text-sm font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-stone-900">{value}</dd>
    </div>
  );
}

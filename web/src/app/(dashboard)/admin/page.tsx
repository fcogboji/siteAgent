import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [userCount, jobCount, photoCount, subscribedCount] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.photo.count(),
    prisma.user.count({
      where: {
        stripeSubscriptionStatus: { in: ["active", "trialing"] },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Admin dashboard</h1>
      <p className="mt-1 text-stone-600">Overview of your SiteProof instance.</p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={userCount} />
        <StatCard label="Subscribed users" value={subscribedCount} />
        <StatCard label="Total jobs" value={jobCount} />
        <StatCard label="Total photos" value={photoCount} />
      </dl>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <dt className="text-sm font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-stone-900">{value}</dd>
    </div>
  );
}

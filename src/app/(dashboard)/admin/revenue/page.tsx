import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLAN_PRICES = { starter: 12, pro: 19, team: 39 } as const;

export default async function AdminRevenuePage() {
  const [byPlan, subscribed, trialing, churnedThisMonth, allUsers] = await Promise.all([
    prisma.user.groupBy({
      by: ["plan"],
      where: {
        plan: { not: null },
        stripeSubscriptionStatus: { in: ["active", "trialing"] },
        suspended: false,
      },
      _count: true,
    }),
    prisma.user.count({
      where: {
        stripeSubscriptionStatus: { in: ["active", "trialing"] },
        suspended: false,
      },
    }),
    prisma.user.count({
      where: { stripeSubscriptionStatus: "trialing" },
    }),
    prisma.user.count({
      where: {
        stripeSubscriptionStatus: { in: ["canceled", "unpaid"] },
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.user.findMany({
      where: { stripeSubscriptionStatus: "trialing" },
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  let mrr = 0;
  for (const row of byPlan) {
    const plan = row.plan as keyof typeof PLAN_PRICES;
    if (plan && plan in PLAN_PRICES) {
      mrr += (PLAN_PRICES[plan] ?? 0) * (row._count ?? 0);
    }
  }
  const arr = mrr * 12;
  const totalUsers = await prisma.user.count();
  const conversionRate = totalUsers > 0 ? ((subscribed / totalUsers) * 100).toFixed(1) : "0";

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Revenue</h1>
      <p className="mt-1 text-stone-600">MRR, plan distribution, and billing overview.</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Key metrics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="MRR (£)" value={`£${mrr}`} />
          <StatCard label="ARR (£)" value={`£${arr}`} />
          <StatCard label="Paid subscribers" value={subscribed} />
          <StatCard label="On trial" value={trialing} />
          <StatCard label="Conversion rate" value={`${conversionRate}%`} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Plan distribution</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(["starter", "pro", "team"] as const).map((plan) => {
            const row = byPlan.find((r) => r.plan === plan);
            const count = row?._count ?? 0;
            const rev = count * (PLAN_PRICES[plan] ?? 0);
            return (
              <div key={plan} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="text-sm font-medium capitalize text-stone-700">{plan}</p>
                <p className="mt-1 text-2xl font-bold text-stone-900">{count}</p>
                <p className="text-sm text-stone-500">£{rev}/mo</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Churn this month</h2>
        <p className="mt-2 text-stone-600">{churnedThisMonth} subscription(s) canceled or unpaid this month.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Trial users (recent)</h2>
        <p className="mt-1 text-stone-600">Users currently on free trial. Monitor for conversion.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-3 py-3 font-semibold text-stone-700">Email</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Started</th>
                <th className="px-3 py-3 font-semibold text-stone-700"></th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-stone-100">
                  <td className="px-3 py-2 text-stone-900">{u.email ?? "—"}</td>
                  <td className="px-3 py-2 text-stone-600">
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {allUsers.length === 0 && (
          <p className="mt-4 text-sm text-stone-500">No users on trial.</p>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <dt className="text-sm font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-stone-900">{value}</dd>
    </div>
  );
}

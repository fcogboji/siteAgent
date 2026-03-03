import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/auth";
import { AdminChartsClient } from "./admin-charts-client";

export const dynamic = "force-dynamic";

export default async function AdminChartsPage() {
  const now = new Date();
  const days = 30;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const [usersByDay, jobsByDay, activeUsersByDay, planCounts] = await Promise.all([
    prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT date_trunc('day', "createdAt")::date::text as date, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" >= ${startDate}
      GROUP BY date_trunc('day', "createdAt")::date
      ORDER BY date ASC
    `,
    prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT date_trunc('day', "createdAt")::date::text as date, COUNT(*)::bigint as count
      FROM "Job"
      WHERE "createdAt" >= ${startDate}
      GROUP BY date_trunc('day', "createdAt")::date
      ORDER BY date ASC
    `,
    prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT date_trunc('day', "updatedAt")::date::text as date, COUNT(DISTINCT "userId")::bigint as count
      FROM "Job"
      WHERE "updatedAt" >= ${startDate}
      GROUP BY date_trunc('day', "updatedAt")::date
      ORDER BY date ASC
    `,
    prisma.user.groupBy({
      by: ["plan"],
      where: { plan: { not: null } },
      _count: true,
    }),
  ]);

  const totalUsers = await prisma.user.count();
  const subscribed = await prisma.user.count({
    where: {
      stripeSubscriptionStatus: { in: ["active", "trialing"] },
      suspended: false,
    },
  });
  const trialing = await prisma.user.count({
    where: { stripeSubscriptionStatus: "trialing" },
  });
  const paid = subscribed - trialing;

  const funnel = [
    { stage: "Signed up", value: totalUsers },
    { stage: "On trial", value: trialing },
    { stage: "Paid", value: paid },
  ];

  const signupsData = usersByDay.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
  const jobsData = jobsByDay.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
  const activeData = activeUsersByDay.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
  const planData = planCounts.map((r) => ({
    name: r.plan || "none",
    value: r._count,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Charts & performance</h1>
      <p className="mt-1 text-stone-600">Track app performance over the last 30 days.</p>
      <AdminChartsClient
        signupsData={signupsData}
        jobsData={jobsData}
        activeData={activeData}
        planData={planData}
        funnelData={funnel}
      />
    </div>
  );
}

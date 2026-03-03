import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription, getCurrentUserId } from "@/lib/auth";
import { format } from "date-fns";
import { AdminUserActions } from "../admin-user-actions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, currentUserId] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { updatedAt: "desc" },
          take: 20,
          include: { _count: { select: { photos: true } } },
        },
        _count: { select: { jobs: true } },
      },
    }),
    getCurrentUserId(),
  ]);

  if (!user) notFound();

  const hasSub = hasActiveSubscription(user.stripeSubscriptionStatus);
  const isOwner = user.plan === "team" || user.plan === "pro";
  const team = isOwner
    ? await prisma.team.findUnique({
        where: { ownerId: user.id },
        include: { members: { include: { user: { select: { email: true, name: true } } } } },
      })
    : null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/users"
          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">User: {user.email ?? user.id}</h1>
      </div>

      <div className="space-y-8">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Profile</h2>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">Email</dt>
              <dd className="font-medium text-stone-900">{user.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Name</dt>
              <dd className="font-medium text-stone-900">{user.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Company</dt>
              <dd className="font-medium text-stone-900">{user.companyName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Plan</dt>
              <dd className="font-medium text-stone-900">{user.plan ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Subscription</dt>
              <dd>
                <span
                  className={
                    user.suspended
                      ? "rounded bg-red-100 px-2 py-0.5 text-red-800"
                      : hasSub
                        ? "rounded bg-green-100 px-2 py-0.5 text-green-800"
                        : "rounded bg-stone-100 px-2 py-0.5 text-stone-600"
                  }
                >
                  {user.suspended ? "Suspended" : user.stripeSubscriptionStatus ?? "No plan"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Joined</dt>
              <dd className="font-medium text-stone-900">{format(user.createdAt, "d MMM yyyy")}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Total jobs</dt>
              <dd className="font-medium text-stone-900">{user._count.jobs}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <AdminUserActions variant="block"
              userId={user.id}
              stripeCustomerId={user.stripeCustomerId}
              stripeSubscriptionId={user.stripeSubscriptionId}
              stripeSubscriptionStatus={user.stripeSubscriptionStatus}
              isCurrentUser={currentUserId === user.id}
              suspended={user.suspended}
              isAdmin={user.isAdmin}
            />
            <a
              href={`/api/admin/gdpr-export?userId=${user.id}`}
              className="rounded border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              download
            >
              GDPR export
            </a>
          </div>
        </section>

        {team && (
          <section className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="font-semibold text-stone-900">Team</h2>
            <p className="mt-2 text-sm text-stone-600">
              Owner of team with {team.members.length} member(s)
            </p>
          </section>
        )}

        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Recent jobs</h2>
          {user.jobs.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">No jobs yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {user.jobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/jobs/${j.id}`}
                    className="block rounded-lg border border-stone-200 px-4 py-3 hover:bg-stone-50"
                  >
                    <span className="font-medium text-stone-900">{j.title}</span>
                    <span className="ml-2 text-sm text-stone-500">{j._count.photos} photos</span>
                    <span className="ml-2 text-sm text-stone-400">
                      {format(j.updatedAt, "d MMM yyyy")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

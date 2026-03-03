import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { AdminUsersClient } from "./admin-users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUserId = await getCurrentUserId();
  const { q } = await searchParams;

  const where = q?.trim()
    ? {
        OR: [
          { email: { contains: q.trim(), mode: "insensitive" as const } },
          { name: { contains: q.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { jobs: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Users</h1>
      <p className="mt-1 text-stone-600">Manage users, subscriptions, and access.</p>
      <div className="mt-6">
        <AdminUsersClient users={users} currentUserId={currentUserId} />
      </div>
    </div>
  );
}

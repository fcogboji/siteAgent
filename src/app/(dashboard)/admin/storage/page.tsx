import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ESTIMATED_KB_PER_PHOTO = 400;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default async function AdminStoragePage() {
  const [totalPhotos, byUser, jobsWithPhotos] = await Promise.all([
    prisma.photo.count(),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        _count: { select: { jobs: true } },
      },
    }),
    prisma.job.findMany({
      select: {
        userId: true,
        _count: { select: { photos: true } },
      },
    }),
  ]);

  const photoByUser = new Map<string, number>();
  for (const j of jobsWithPhotos) {
    photoByUser.set(j.userId, (photoByUser.get(j.userId) ?? 0) + j._count.photos);
  }

  const totalBytes = totalPhotos * ESTIMATED_KB_PER_PHOTO * 1024;
  const usersWithData = byUser.map((u) => ({
    ...u,
    photoCount: photoByUser.get(u.id) ?? 0,
  }));

  const topUsers = [...usersWithData]
    .filter((u) => u.photoCount > 0)
    .sort((a, b) => b.photoCount - a.photoCount)
    .slice(0, 30);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Storage estimate</h1>
      <p className="mt-1 text-stone-600">
        Rough estimate based on {ESTIMATED_KB_PER_PHOTO} KB per photo. Actual usage depends on upload size and compression.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Totals</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-medium text-stone-500">Total photos</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{totalPhotos.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-medium text-stone-500">Estimated storage</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{formatBytes(totalBytes)}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Top users by storage</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-3 py-3 font-semibold text-stone-700">Email</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Jobs</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Photos</th>
                <th className="px-3 py-3 font-semibold text-stone-700">Est. storage</th>
                <th className="px-3 py-3 font-semibold text-stone-700"></th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((u) => {
                const bytes = u.photoCount * ESTIMATED_KB_PER_PHOTO * 1024;
                return (
                  <tr key={u.id} className="border-b border-stone-100">
                    <td className="px-3 py-2 text-stone-900">{u.email ?? "—"}</td>
                    <td className="px-3 py-2 text-stone-600">{u._count.jobs}</td>
                    <td className="px-3 py-2 text-stone-600">{u.photoCount}</td>
                    <td className="px-3 py-2 text-stone-600">{formatBytes(bytes)}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {topUsers.length === 0 && (
          <p className="mt-4 text-sm text-stone-500">No users with photos yet.</p>
        )}
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  suspend: "Suspend user",
  restore: "Restore user",
  cancel_sub: "Cancel subscription",
  restore_sub: "Restore subscription",
  delete: "Delete user",
  bulk_suspend: "Bulk suspend",
  bulk_restore: "Bulk restore",
};

export default async function AdminAuditPage() {
  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const adminIds = [...new Set(logs.map((l) => l.adminId))];
  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, email: true, name: true },
  });
  const adminMap = Object.fromEntries(admins.map((a) => [a.id, a.email || a.name || a.id]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Audit log</h1>
      <p className="mt-1 text-stone-600">Admin actions for compliance and debugging.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-3 py-3 font-semibold text-stone-700">When</th>
              <th className="px-3 py-3 font-semibold text-stone-700">Admin</th>
              <th className="px-3 py-3 font-semibold text-stone-700">Action</th>
              <th className="px-3 py-3 font-semibold text-stone-700">Target / Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-stone-100">
                <td className="px-3 py-2 text-stone-500">
                  {format(new Date(log.createdAt), "d MMM yyyy, HH:mm")}
                </td>
                <td className="px-3 py-2 text-stone-700">{adminMap[log.adminId] ?? log.adminId}</td>
                <td className="px-3 py-2 font-medium text-stone-900">
                  {ACTION_LABELS[log.action] ?? log.action}
                </td>
                <td className="px-3 py-2 text-stone-600">
                  {log.targetId && (
                    <a href={`/admin/users/${log.targetId}`} className="text-primary hover:underline">
                      {log.targetId}
                    </a>
                  )}
                  {log.details && ` — ${log.details}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {logs.length === 0 && (
        <p className="mt-6 text-stone-500">No audit logs yet.</p>
      )}
    </div>
  );
}

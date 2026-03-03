import { prisma } from "./prisma";

export async function logAdminAction(
  adminId: string,
  action: string,
  targetId?: string | null,
  details?: string | null
) {
  await prisma.adminAuditLog.create({
    data: { adminId, action, targetId: targetId ?? undefined, details: details ?? undefined },
  });
}

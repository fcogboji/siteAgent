"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-audit";

export async function adminCancelSubscription(userId: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeSubscriptionId) return { error: "No subscription" };
  const stripe = getStripe();
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  await logAdminAction(admin.id, "cancel_sub", userId);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminRestoreSubscription(userId: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeSubscriptionId) return { error: "No subscription" };
  const stripe = getStripe();
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
  await logAdminAction(admin.id, "restore_sub", userId);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminDeleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return { error: "Cannot delete yourself" };
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  await prisma.user.delete({ where: { id: userId } });
  await logAdminAction(admin.id, "delete", userId, target?.email ?? undefined);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminSuspendUser(userId: string) {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };
  if (user.isAdmin) return { error: "Cannot suspend an admin" };
  await prisma.user.update({ where: { id: userId }, data: { suspended: true } });
  await logAdminAction(admin.id, "suspend", userId, user.email ?? undefined);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  return { ok: true };
}

export async function adminRestoreUser(userId: string) {
  const admin = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { suspended: false } });
  await logAdminAction(admin.id, "restore", userId);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  return { ok: true };
}

export async function adminBulkSuspend(userIds: string[]) {
  const admin = await requireAdmin();
  const valid = userIds.filter(Boolean);
  if (valid.length === 0) return { error: "No users selected" };
  const users = await prisma.user.findMany({
    where: { id: { in: valid }, isAdmin: false },
    select: { id: true },
  });
  await prisma.user.updateMany({
    where: { id: { in: users.map((u) => u.id) } },
    data: { suspended: true },
  });
  await logAdminAction(admin.id, "bulk_suspend", valid.join(","), `${users.length} users`);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, count: users.length };
}

export async function adminBulkRestore(userIds: string[]) {
  const admin = await requireAdmin();
  const valid = userIds.filter(Boolean);
  if (valid.length === 0) return { error: "No users selected" };
  await prisma.user.updateMany({
    where: { id: { in: valid } },
    data: { suspended: false },
  });
  await logAdminAction(admin.id, "bulk_restore", valid.join(","), `${valid.length} users`);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, count: valid.length };
}

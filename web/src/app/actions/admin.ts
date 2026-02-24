"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/auth";

export async function adminCancelSubscription(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeSubscriptionId) return { error: "No subscription" };
  const stripe = getStripe();
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminRestoreSubscription(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeSubscriptionId) return { error: "No subscription" };
  const stripe = getStripe();
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminDeleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return { error: "Cannot delete yourself" };
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

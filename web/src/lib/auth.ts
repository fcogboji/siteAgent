import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

/** True if Clerk session says admin (org role or custom session claims). */
async function isAdminByClerkSession(): Promise<boolean> {
  const { sessionClaims, orgRole } = await auth();
  if (orgRole === "admin" || orgRole === "org:admin") return true;
  const c = sessionClaims as Record<string, unknown> | null | undefined;
  if (!c) return false;
  const role =
    (c.metadata as { role?: string } | undefined)?.role ??
    (c.public_metadata as { role?: string } | undefined)?.role ??
    (c.role as string | undefined);
  return role === "admin";
}

/** True if Clerk Backend API user publicMetadata.role === "admin". Works as soon as you set it in Clerk Dashboard. */
async function isAdminByClerkApi(clerkId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    const role = (clerkUser.publicMetadata as { role?: string } | undefined)?.role;
    return role === "admin";
  } catch {
    return false;
  }
}

/** Single source of truth: is this user an admin? (DB flag, ADMIN_EMAILS, Clerk session, or Clerk API publicMetadata.) */
export async function isAdmin(
  user: { clerkId: string; email: string | null; isAdmin: boolean } | null,
): Promise<boolean> {
  if (!user) return false;
  if (user.isAdmin) return true;
  const emails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (user.email && emails.includes(user.email.toLowerCase())) return true;
  if (await isAdminByClerkSession()) return true;
  if (await isAdminByClerkApi(user.clerkId)) return true;
  return false;
}

export type UserWithSubscription = Awaited<ReturnType<typeof getCurrentUser>>;

export async function getCurrentUserId(): Promise<string | null> {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) return null;

  const email = (sessionClaims?.email as string) ?? null;
  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId, email },
    });
  } else if (email && user.email !== email) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { email },
    });
  }
  return user.id;
}

export async function getCurrentUser() {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) return null;

  const email = (sessionClaims?.email as string) ?? null;
  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId, email },
    });
  } else if (email && user.email !== email) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { email },
    });
  }
  return user;
}

export function hasActiveSubscription(status: string | null): boolean {
  return status != null && ACTIVE_STATUSES.includes(status as (typeof ACTIVE_STATUSES)[number]);
}

export async function requireUserId(): Promise<string> {
  const id = await getCurrentUserId();
  if (!id) throw new Error("Unauthorized");
  return id;
}

/** Redirect to /pricing if user is not on an active/trialing subscription. Call from dashboard layout (skip for /pricing and /admin). */
export async function requireSubscriptionOrRedirect(allowedPaths: string[] = ["/pricing"]): Promise<{ user: NonNullable<UserWithSubscription>; hasSubscription: boolean } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const hasSubscription = hasActiveSubscription(user.stripeSubscriptionStatus);
  return { user, hasSubscription };
}

/** Use in admin layout: redirect if not admin. */
export async function requireAdmin(): Promise<NonNullable<UserWithSubscription>> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!(await isAdmin(user))) redirect("/");
  return user;
}

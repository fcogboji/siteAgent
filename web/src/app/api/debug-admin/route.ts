import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/** Dev-only: see why admin access might be denied. Call when signed in. */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }
  const user = await getCurrentUser();
  const admin = await isAdmin(user);
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const inAdminList = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;

  return NextResponse.json({
    isAdmin: admin,
    userEmail: user?.email ?? null,
    userIsAdminFlag: user?.isAdmin ?? false,
    inAdminEmailsList: inAdminList,
    adminEmailsConfigured: adminEmails.length > 0,
    hint: !admin
      ? "Grant admin: 1) Clerk Dashboard → Users → your user → Public metadata → {\"role\":\"admin\"}. 2) Or set ADMIN_EMAILS=your@email.com in env and redeploy. 3) Or in DB set User.isAdmin=true."
      : undefined,
  });
}

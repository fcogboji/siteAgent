import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const membershipId = body.membershipId as string;
    const role = body.role as string;
    if (!membershipId || !role || !["admin", "member"].includes(role))
      return NextResponse.json({ error: "membershipId and role (admin|member) required" }, { status: 400 });

    const membership = await prisma.teamMember.findUnique({
      where: { id: membershipId },
      include: { team: true },
    });
    if (!membership || membership.team.ownerId !== user.id)
      return NextResponse.json({ error: "Membership not found or only owner can change roles" }, { status: 403 });

    await prisma.teamMember.update({
      where: { id: membershipId },
      data: { role },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error(e);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

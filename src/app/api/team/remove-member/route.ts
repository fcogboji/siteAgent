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
    if (!membershipId) return NextResponse.json({ error: "membershipId required" }, { status: 400 });

    const membership = await prisma.teamMember.findUnique({
      where: { id: membershipId },
      include: { team: { include: { members: true } } },
    });
    const isOwner = membership?.team.ownerId === user.id;
    const actorMembership = membership?.team.members.find((m) => m.userId === user.id);
    const isAdmin = actorMembership?.role === "admin";
    if (!membership || (!isOwner && !isAdmin))
      return NextResponse.json({ error: "Membership not found or you cannot remove members" }, { status: 403 });

    await prisma.teamMember.delete({ where: { id: membershipId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error(e);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}

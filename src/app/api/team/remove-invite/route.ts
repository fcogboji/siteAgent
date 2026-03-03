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
    const inviteId = body.inviteId as string;
    if (!inviteId) return NextResponse.json({ error: "inviteId required" }, { status: 400 });

    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: { team: { include: { members: true } } },
    });
    const isOwner = invite?.team.ownerId === user.id;
    const actorMembership = invite?.team.members.find((m) => m.userId === user.id);
    const isAdmin = actorMembership?.role === "admin";
    if (!invite || (!isOwner && !isAdmin))
      return NextResponse.json({ error: "Invite not found or you cannot remove invites" }, { status: 403 });

    await prisma.teamInvite.delete({ where: { id: inviteId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error(e);
    return NextResponse.json({ error: "Failed to remove invite" }, { status: 500 });
  }
}

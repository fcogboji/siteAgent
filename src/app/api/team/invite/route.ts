import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getMaxTeamMembers } from "@/lib/team-limits";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const teamId = body.teamId as string;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!teamId || !email) return NextResponse.json({ error: "teamId and email required" }, { status: 400 });

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, owner: true },
    });
    const isOwner = team?.ownerId === user.id;
    const membership = team?.members.find((m) => m.userId === user.id);
    const isAdmin = membership?.role === "admin";
    if (!team || (!isOwner && !isAdmin))
      return NextResponse.json({ error: "Team not found or you cannot invite" }, { status: 403 });

    const maxMembers = getMaxTeamMembers(team.owner.plan);
    if (team.members.length >= maxMembers)
      return NextResponse.json({ error: `Team is full (max ${maxMembers} members)` }, { status: 400 });

    const existing = await prisma.teamMember.findFirst({ where: { teamId, user: { email } } });
    if (existing) return NextResponse.json({ error: "This user is already in the team" }, { status: 400 });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const token = randomBytes(24).toString("hex");

    await prisma.teamInvite.upsert({
      where: { teamId_email: { teamId, email } },
      create: { teamId, inviterId: user.id, email, token, expiresAt },
      update: { token, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://site-agent-three.vercel.app";
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Send email if Resend is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM || "Site Agent <onboarding@resend.dev>";
      const inviterName = user.companyName || user.email || "A team owner";
      const { error: sendError } = await resend.emails.send({
        from,
        to: email,
        subject: `You're invited to join a team on Site Agent`,
        html: `
          <p>${inviterName} has invited you to join their team on Site Agent.</p>
          <p>Click the link below to sign in or sign up and join the team. This link expires in 7 days.</p>
          <p><a href="${inviteUrl}" style="color: #b45309; font-weight: 600;">Accept invite</a></p>
          <p>Or copy this link: ${inviteUrl}</p>
        `,
      });
      if (sendError && process.env.NODE_ENV === "development") console.error("Resend error:", sendError);
    }

    return NextResponse.json({ inviteUrl, emailSent: !!resendKey });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error(e);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}

import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getMaxTeamMembers } from "@/lib/team-limits";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    const redirectUrl = `/invite/${token}`;
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }

  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  // Sync name and email from Clerk so owner sees member names
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const first = clerkUser.firstName ?? null;
    const last = clerkUser.lastName ?? null;
    const name = first && last ? `${first} ${last}`.trim() : (first ?? last ?? null);
    const updates: { email?: string; name?: string } = {};
    if (email && user.email !== email) updates.email = email;
    if (name && user.name !== name) updates.name = name;
    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({ where: { id: user.id }, data: updates });
    }
  } catch {
    // ignore Clerk errors
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { team: { include: { members: true, owner: true } } },
  });

  if (!invite || invite.expiresAt < new Date()) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-lg font-bold text-stone-900">Invalid or expired invite</h1>
        <p className="mt-2 text-stone-600">This invite link has expired or doesn’t exist.</p>
        <Link href="/" className="mt-6 inline-block font-medium text-primary hover:text-primary-hover">
          Go to dashboard
        </Link>
      </div>
    );
  }

  const maxMembers = getMaxTeamMembers(invite.team.owner.plan);
  if (invite.team.members.length >= maxMembers) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-lg font-bold text-stone-900">Team is full</h1>
        <p className="mt-2 text-stone-600">This team has reached the maximum number of members.</p>
        <Link href="/" className="mt-6 inline-block font-medium text-primary hover:text-primary-hover">
          Go to dashboard
        </Link>
      </div>
    );
  }

  const alreadyMember = invite.team.members.some((m) => m.userId === user.id);
  if (alreadyMember) {
    redirect("/team");
  }

  // Optional: require invite email to match user email (or allow any signed-in user)
  const emailMatch = user.email && user.email.toLowerCase() === invite.email.toLowerCase();
  if (!emailMatch && user.email) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-lg font-bold text-stone-900">Wrong account</h1>
        <p className="mt-2 text-stone-600">
          This invite was sent to {invite.email}. You’re signed in as {user.email}. Sign in with {invite.email} to join.
        </p>
        <Link href="/" className="mt-6 inline-block font-medium text-primary hover:text-primary-hover">
          Go to dashboard
        </Link>
      </div>
    );
  }

  await prisma.teamMember.create({
    data: { teamId: invite.teamId, userId: user.id },
  });
  await prisma.teamInvite.delete({ where: { id: invite.id } });

  redirect("/?joined=team");
}

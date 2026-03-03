import { redirect } from "next/navigation";
import { getCurrentUser, hasActiveSubscription, isTeamMemberOfActiveTeam } from "@/lib/auth";
import { getMaxTeamSlots } from "@/lib/team-limits";
import { prisma } from "@/lib/prisma";
import { TeamInviteForm } from "./team-invite-form";
import { TeamMembersList } from "./team-members-list";
import { TeamActivityFeed } from "./team-activity-feed";
import { TeamBrandingForm } from "./team-branding-form";
import { TeamTemplatesSection } from "./team-templates-section";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const canOwnTeam = (user.plan === "team" || user.plan === "pro") && hasActiveSubscription(user.stripeSubscriptionStatus);
  const isOwner = !!canOwnTeam;
  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id },
    include: { team: { include: { owner: true, members: { include: { user: true } }, invites: true, jobTemplates: { select: { id: true, name: true, title: true } } } } },
  });
  const isMember = !!membership;
  const isAdminMember = isMember && membership!.role === "admin";

  if (!isOwner && !isMember) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-stone-900">Team</h1>
        <p className="mt-2 text-stone-600">
          Upgrade to Pro (up to 5 users) or Team (up to 15 users) to invite people to your workspace.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
        >
          View plans
        </Link>
      </div>
    );
  }

  if (isMember && !isOwner && !isAdminMember) {
    const owner = membership!.team.owner;
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-stone-200 bg-white p-8">
        <h1 className="text-xl font-bold text-stone-900">Team</h1>
        <p className="mt-2 text-stone-600">
          You’re part of <span className="font-medium text-stone-900">{owner.companyName || owner.email || "your team"}</span>’s workspace. Jobs are shared with the team.
        </p>
        <Link href="/" className="mt-6 inline-block font-medium text-primary hover:text-primary-hover">
          ← Back to jobs
        </Link>
      </div>
    );
  }

  // Owner or admin: get team
  let team;
  if (isOwner) {
    team = await prisma.team.findUnique({
      where: { ownerId: user.id },
      include: {
        members: { include: { user: true } },
        invites: true,
        jobTemplates: { select: { id: true, name: true, title: true } },
      },
    });
    if (!team) {
      team = await prisma.team.create({
        data: { ownerId: user.id, name: user.companyName || undefined },
        include: {
          members: { include: { user: true } },
          invites: true,
          jobTemplates: { select: { id: true, name: true, title: true } },
        },
      });
    }
  } else {
    team = membership!.team;
  }

  const ownerPlan = isOwner ? user.plan : membership!.team.owner.plan;
  const totalSlots = getMaxTeamSlots(ownerPlan);
  const usedSlots = 1 + team.members.length; // owner + members
  const canInvite = usedSlots < totalSlots;

  const workspaceOwnerId = team.ownerId;
  // Recent activity: jobs owned by workspace owner
  const recentActivities = await prisma.activity.findMany({
    where: { job: { userId: workspaceOwnerId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { id: true, name: true, email: true } },
      job: { select: { id: true, title: true } },
    },
  });

  // Usage stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [jobsThisMonth, totalPhotos, reportsCount] = await Promise.all([
    prisma.job.count({ where: { userId: workspaceOwnerId, createdAt: { gte: startOfMonth } } }),
    prisma.photo.count({ where: { job: { userId: workspaceOwnerId } } }),
    prisma.job.count({ where: { userId: workspaceOwnerId, reportSlug: { not: null } } }),
  ]);

  const ownerUser = isOwner ? user : membership!.team.owner;
  const people: { id: string; label: string }[] = [
    { id: ownerUser.id, label: ownerUser.name || ownerUser.email || "Owner" },
    ...team.members.map((m) => ({
      id: m.user.id,
      label: m.user.name || m.user.email || "Team member",
    })),
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Team</h1>
        <p className="mt-1 text-stone-600">
          Invite up to {totalSlots - 1} members. You all share the same jobs.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-stone-200 bg-white p-4">
          <div>
            <p className="text-2xl font-bold text-stone-900">{jobsThisMonth}</p>
            <p className="text-xs text-stone-500">Jobs this month</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900">{totalPhotos}</p>
            <p className="text-xs text-stone-500">Total photos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900">{reportsCount}</p>
            <p className="text-xs text-stone-500">Reports generated</p>
          </div>
        </div>
      </div>

      {canInvite && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Invite by email</h2>
          <p className="mt-1 text-sm text-stone-500">
            They’ll get a link to sign in or sign up and join your team.
          </p>
          <TeamInviteForm teamId={team.id} />
        </div>
      )}

      {!canInvite && (
        <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-stone-800">
          You’ve reached the maximum of {totalSlots} people. Remove a member to invite someone new.
        </p>
      )}

      {ownerPlan === "team" && isOwner && (
        <>
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="font-semibold text-stone-900">Company branding</h2>
            <p className="mt-1 text-sm text-stone-500">
              Add your logo and company name to report PDFs. Team plan only.
            </p>
            <TeamBrandingForm
              teamId={team.id}
              initialName={team.name}
              initialLogoUrl={team.logoUrl}
              initialCompanyContact={team.companyContact}
            />
          </div>
          <TeamTemplatesSection teamId={team.id} templates={team.jobTemplates} />
        </>
      )}

      <TeamMembersList team={team} currentUserId={user.id} />

      <div>
        <h2 className="mb-2 text-base font-semibold text-stone-900">Member activity</h2>
        <p className="mb-4 text-sm text-stone-500">
          See what your team members are doing — jobs created, photos added, notes and signatures.
        </p>
        <TeamActivityFeed activities={recentActivities} people={people} />
      </div>
    </div>
  );
}

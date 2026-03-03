import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/** Admin-only: export all data for a user (GDPR data portability). */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      jobs: {
        include: {
          photos: { select: { id: true, imageUrl: true, note: true, tag: true, createdAt: true } },
          signature: { select: { signedBy: true, createdAt: true } },
          activities: {
            select: { action: true, createdAt: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      teamMemberships: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              owner: { select: { email: true } },
            },
          },
        },
      },
      teamOwned: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              user: { select: { email: true, name: true } },
              role: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    profile: {
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      plan: user.plan,
      stripeSubscriptionStatus: user.stripeSubscriptionStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    jobs: user.jobs.map((j) => ({
      id: j.id,
      title: j.title,
      clientName: j.clientName,
      address: j.address,
      notes: j.notes,
      reportSlug: j.reportSlug,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
      photos: j.photos,
      signature: j.signature,
      activities: j.activities,
    })),
    teamMemberships: user.teamMemberships.map((m) => ({
      teamId: m.team.id,
      teamName: m.team.name,
      ownerEmail: m.team.owner?.email,
    })),
    teamOwned: user.teamOwned
      ? {
          id: user.teamOwned.id,
          name: user.teamOwned.name,
          members: user.teamOwned.members.map((m) => ({
            email: m.user.email,
            name: m.user.name,
            role: m.role,
          })),
        }
      : null,
  };

  return NextResponse.json(exportData, {
    headers: {
      "Content-Disposition": `attachment; filename="gdpr-export-${user.email ?? user.id}-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

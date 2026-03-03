"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireEffectiveUserIdForJobs,
  requireUserId,
  getCurrentUser,
  hasActiveSubscription,
} from "@/lib/auth";

export type TemplateInput = {
  name: string;
  title: string;
  clientName?: string | null;
  address?: string | null;
  defaultNotes?: string | null;
};

/** Create personal template (Pro+) or team template (Team plan owner only). */
export async function createTemplate(
  input: TemplateInput,
  teamId?: string | null
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required" };

  const effectiveUserId = await requireEffectiveUserIdForJobs();
  const actorId = await requireUserId();

  if (!input.name?.trim() || !input.title?.trim()) {
    return { error: "Name and title are required" };
  }

  if (teamId) {
    // Team template - only Team plan owners
    const team = await prisma.team.findFirst({
      where: { id: teamId, ownerId: effectiveUserId },
      include: { owner: true },
    });
    if (!team || team.owner.plan !== "team" || !hasActiveSubscription(team.owner.stripeSubscriptionStatus)) {
      return { error: "Team plan required for team templates" };
    }
    await prisma.jobTemplate.create({
      data: {
        name: input.name.trim(),
        title: input.title.trim(),
        clientName: input.clientName?.trim() || null,
        address: input.address?.trim() || null,
        defaultNotes: input.defaultNotes?.trim() || null,
        teamId: team.id,
      },
    });
  } else {
    // Personal template - Pro+ (anyone with subscription)
    if (!hasActiveSubscription(user.stripeSubscriptionStatus)) {
      const membership = await prisma.teamMember.findFirst({
        where: { userId: user.id },
        include: { team: { include: { owner: true } } },
      });
      const hasAccess = membership?.team.owner && hasActiveSubscription(membership.team.owner.stripeSubscriptionStatus);
      if (!hasAccess) return { error: "Subscription required for templates" };
    }
    await prisma.jobTemplate.create({
      data: {
        name: input.name.trim(),
        title: input.title.trim(),
        clientName: input.clientName?.trim() || null,
        address: input.address?.trim() || null,
        defaultNotes: input.defaultNotes?.trim() || null,
        userId: effectiveUserId,
      },
    });
  }

  revalidatePath("/jobs/new");
  revalidatePath("/team");
  return { ok: true };
}

/** Delete template. */
export async function deleteTemplate(templateId: string) {
  const effectiveUserId = await requireEffectiveUserIdForJobs();
  const template = await prisma.jobTemplate.findFirst({
    where: {
      id: templateId,
      OR: [
        { userId: effectiveUserId },
        { team: { ownerId: effectiveUserId } },
      ],
    },
  });
  if (!template) return { error: "Template not found" };
  await prisma.jobTemplate.delete({ where: { id: templateId } });
  revalidatePath("/jobs/new");
  revalidatePath("/team");
  return { ok: true };
}

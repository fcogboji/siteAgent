"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserIdForJobs } from "@/lib/auth";

export async function updateTeamBranding(
  teamId: string,
  data: { name?: string; logoUrl?: string; companyContact?: string }
) {
  const userId = await getEffectiveUserIdForJobs();
  if (!userId) return { error: "Sign in required" };

  const team = await prisma.team.findFirst({
    where: { id: teamId, ownerId: userId },
  });
  if (!team) return { error: "Team not found" };

  await prisma.team.update({
    where: { id: teamId },
    data: {
      name: data.name ?? team.name,
      logoUrl: data.logoUrl !== undefined ? (data.logoUrl || null) : team.logoUrl,
      companyContact: data.companyContact !== undefined ? (data.companyContact || null) : team.companyContact,
    },
  });
  revalidatePath("/team");
  return { ok: true };
}

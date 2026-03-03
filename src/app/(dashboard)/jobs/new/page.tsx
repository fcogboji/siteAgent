import Link from "next/link";
import { redirect } from "next/navigation";
import { getEffectiveUserIdForJobs, getCurrentUser, hasActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateJobForm } from "./form";
import { CreateTemplateForm } from "./create-template-form";

export default async function NewJobPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const effectiveUserId = await getEffectiveUserIdForJobs();
  if (!effectiveUserId) redirect("/sign-in");

  const hasAccess = hasActiveSubscription(user.stripeSubscriptionStatus) || false;
  type TemplateRow = { id: string; name: string; title: string; clientName: string | null; address: string | null; defaultNotes: string | null };
  let personalTemplates: TemplateRow[] = [];
  let teamTemplates: TemplateRow[] = [];

  if (hasAccess) {
    personalTemplates = await prisma.jobTemplate.findMany({
      where: { userId: effectiveUserId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, title: true, clientName: true, address: true, defaultNotes: true },
    });
  }

  const team = await prisma.team.findUnique({
    where: { ownerId: effectiveUserId },
    include: { jobTemplates: { orderBy: { name: "asc" }, select: { id: true, name: true, title: true, clientName: true, address: true, defaultNotes: true } } },
  });
  if (team && user.plan === "team") {
    teamTemplates = team.jobTemplates;
  }

  const templates = [
    ...personalTemplates.map((t) => ({ ...t, scope: "personal" as const })),
    ...teamTemplates.map((t) => ({ ...t, scope: "team" as const })),
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-700 active:bg-stone-300"
            aria-label="Back"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold text-stone-900">New job</h1>
        </div>
      </div>
      <CreateJobForm templates={templates} />
      {hasAccess && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Save as template</h2>
          <p className="mt-1 text-sm text-stone-500">
            Create a personal template to reuse job details. Available when creating new jobs.
          </p>
          <CreateTemplateForm />
        </div>
      )}
    </div>
  );
}

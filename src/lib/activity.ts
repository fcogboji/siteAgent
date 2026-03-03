import { prisma } from "./prisma";

export type ActivityAction =
  | "job_created"
  | "photo_added"
  | "notes_updated"
  | "signature_added"
  | "report_generated";

/** Record an activity. actorId = the user who performed the action (current user). */
export async function recordActivity(
  actorId: string,
  jobId: string,
  action: ActivityAction
) {
  await prisma.activity.create({
    data: { actorId, jobId, action },
  });
}

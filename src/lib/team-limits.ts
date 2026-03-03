/**
 * Team size limits per plan.
 *
 * To change limits: edit the values below. This file is the single source of truth.
 * Also update:
 * - pricing-section.tsx (features list "Up to X users")
 * - team/page.tsx (upgrade copy "up to X users")
 */
const TEAM_PLAN_MAX_SLOTS = 15;
const PRO_PLAN_MAX_SLOTS = 5;

/** Max total people (owner + members) for each plan. */
export function getMaxTeamSlots(plan: string | null): number {
  if (plan === "team") return TEAM_PLAN_MAX_SLOTS;
  if (plan === "pro") return PRO_PLAN_MAX_SLOTS;
  return 0;
}

/** Max additional members (excluding owner) for each plan. */
export function getMaxTeamMembers(plan: string | null): number {
  return Math.max(0, getMaxTeamSlots(plan) - 1);
}

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

export const TRIAL_DAYS = 7;

export type BillingInterval = "monthly" | "yearly";

export function getPriceId(plan: "starter" | "pro" | "team", interval: BillingInterval = "monthly"): string | null {
  const suffix = interval === "yearly" ? "_YEARLY" : "";
  const key =
    plan === "starter"
      ? `STRIPE_STARTER_PRICE_ID${suffix}`
      : plan === "pro"
        ? `STRIPE_PRO_PRICE_ID${suffix}`
        : `STRIPE_TEAM_PRICE_ID${suffix}`;
  return process.env[key] ?? null;
}

"use client";

import { useState } from "react";
import { CheckoutButton } from "@/components/checkout-button";

type Plan = "starter" | "pro" | "team";
type BillingInterval = "monthly" | "yearly";

const PLANS: { plan: Plan; name: string; description: string; features: string[]; highlighted: boolean }[] = [
  {
    plan: "starter",
    name: "Starter",
    description: "Solo trades getting started",
    features: [
      "Unlimited jobs",
      "Timestamped photos",
      "Notes & voice notes",
      "Client signature",
      "PDF reports",
      "Shareable links",
    ],
    highlighted: false,
  },
  {
    plan: "pro",
    name: "Pro",
    description: "Most popular for active trades",
    features: [
      "Everything in Starter",
      "Before / After / Condition tags",
      "Damage protection evidence",
      "Up to 5 users",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    plan: "team",
    name: "Team",
    description: "Small teams & companies",
    features: [
      "Everything in Pro",
      "Up to 15 users",
      "Company branding on reports",
      "Central dashboard",
    ],
    highlighted: false,
  },
];

function formatPrice(n: number): string {
  return n % 1 === 0 ? n.toString() : n.toFixed(2);
}

export function PricingSection({
  planPrices,
  yearlyDiscount,
}: {
  planPrices: { starter: number; pro: number; team: number };
  yearlyDiscount: number;
}) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <>
      {/* Billing toggle */}
      <div className="mb-10 flex justify-center px-2">
        <div className="inline-flex w-full max-w-sm flex-col gap-2 rounded-xl border-2 border-stone-200 bg-white p-2 sm:flex-row sm:max-w-none sm:p-1">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`min-h-[48px] flex-1 rounded-lg px-5 py-3 text-sm font-semibold transition-colors active:scale-[0.99] sm:py-2.5 ${
              interval === "monthly"
                ? "bg-primary text-white"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={`relative min-h-[48px] flex-1 rounded-lg px-5 py-3 text-sm font-semibold transition-colors active:scale-[0.99] sm:py-2.5 ${
              interval === "yearly"
                ? "bg-primary text-white"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            Yearly
            <span className="ml-1.5 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-white">
              Save {Math.round(yearlyDiscount * 100)}%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {PLANS.map(({ plan, name, description, features, highlighted }) => {
          const monthlyPrice = planPrices[plan];
          const pricePerMonth =
            interval === "yearly" ? monthlyPrice * (1 - yearlyDiscount) : monthlyPrice;
          const priceStr = formatPrice(pricePerMonth);
          const yearlyTotal = formatPrice(monthlyPrice * (1 - yearlyDiscount) * 12);

          return (
            <div
              key={plan}
              className={`relative flex flex-col rounded-2xl border-2 p-6 sm:p-8 ${
                highlighted
                  ? "border-primary bg-white shadow-lg ring-2 ring-primary/20"
                  : "border-stone-200 bg-white"
              }`}
            >
              {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-stone-900">{name}</h3>
              <p className="mt-1 text-sm text-stone-600">{description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-stone-900">£{priceStr}</span>
                <span className="text-stone-500">/month</span>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                {interval === "yearly" ? (
                  <>7-day free trial, then £{yearlyTotal}/year (billed annually)</>
                ) : (
                  <>7-day free trial, then £{priceStr}/mo</>
                )}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="mt-0.5 text-primary" aria-hidden>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                plan={plan}
                interval={interval}
                className={`mt-8 block w-full min-h-[48px] rounded-xl py-4 text-center text-sm font-semibold disabled:opacity-70 active:scale-[0.99] sm:py-3 ${
                  highlighted
                    ? "bg-primary text-white hover:bg-primary-hover"
                    : "border-2 border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                }`}
              >
                Start 7-day free trial
              </CheckoutButton>
            </div>
          );
        })}
      </div>
    </>
  );
}

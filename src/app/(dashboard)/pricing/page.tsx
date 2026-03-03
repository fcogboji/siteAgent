import Link from "next/link";
import { Footer } from "@/components/footer";
import { CheckoutButton } from "@/components/checkout-button";
import { PricingSection } from "./pricing-section";

export const dynamic = "force-dynamic";

const PLAN_PRICES = { starter: 12, pro: 19, team: 39 } as const;
const YEARLY_DISCOUNT = 0.2; // 20% off for yearly

export default function PricingPage() {
  return (
    <>
      <div className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Simple pricing for trades who need proof
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              7-day free trial. No charge until the trial ends. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <PricingSection planPrices={PLAN_PRICES} yearlyDiscount={YEARLY_DISCOUNT} />
            <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 px-4 py-4 text-center text-sm text-stone-700 sm:px-6">
              <p className="font-medium">
                7-day free trial — card required. We’ll charge you automatically after the trial. Cancel before day 7 and you won’t be charged.
              </p>
            </div>
          </div>
        </section>
        {/* Features */}
        <section className="border-t border-stone-200 bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold text-stone-900">
              Everything you need to protect your income
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-stone-600">
              Built for UK trades. Works on your phone. No technical skills needed.
            </p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Timestamped photos", desc: "Every photo has date, time and proof it wasn’t edited." },
                { title: "Voice notes", desc: "Speak your notes on site — no typing with dirty hands." },
                { title: "Client signature", desc: "Get sign-off on your phone. Stored in the report." },
                { title: "One-tap reports", desc: "Professional PDF and shareable link in seconds." },
                { title: "Before / After / Condition", desc: "Tag photos for disputes and damage protection." },
                { title: "Works offline", desc: "Add photos on site, sync when you’re back online." },
              ].map((f) => (
                <li key={f.title} className="rounded-xl border border-stone-200 bg-stone-50/50 p-5">
                  <h3 className="font-semibold text-stone-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">{f.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-stone-200 bg-primary px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Start your 7-day free trial
            </h2>
            <p className="mt-4 text-lg text-primary/90">
              No charge for 7 days. Add your card — we’ll only charge you after the trial. Cancel anytime.
            </p>
            <CheckoutButton
              plan="pro"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-primary shadow-lg hover:bg-white/90 disabled:opacity-70"
            >
              Get started — 7 days free
            </CheckoutButton>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

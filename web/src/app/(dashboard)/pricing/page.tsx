import Link from "next/link";
import { Footer } from "@/components/footer";
import { CheckoutButton } from "@/components/checkout-button";

export const dynamic = "force-dynamic";

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
            <div className="grid gap-8 lg:grid-cols-3">
              <PricingCard
                name="Starter"
                price="12"
                description="Solo trades getting started"
                features={[
                  "Unlimited jobs",
                  "Timestamped photos",
                  "Notes & voice notes",
                  "Client signature",
                  "PDF reports",
                  "Shareable links",
                ]}
                cta="Start 7-day free trial"
                plan="starter"
                highlighted={false}
              />
              <PricingCard
                name="Pro"
                price="19"
                description="Most popular for active trades"
                features={[
                  "Everything in Starter",
                  "Before / After / Condition tags",
                  "Damage protection evidence",
                  "Priority support",
                ]}
                cta="Start 7-day free trial"
                plan="pro"
                highlighted={true}
              />
              <PricingCard
                name="Team"
                price="39"
                description="Small teams & companies"
                features={[
                  "Everything in Pro",
                  "Up to 5 users",
                  "Company branding on reports",
                  "Central dashboard",
                ]}
                cta="Start 7-day free trial"
                plan="team"
                highlighted={false}
              />
            </div>
            <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-4 text-center text-sm text-stone-700 sm:px-6">
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
        <section className="border-t border-stone-200 bg-amber-600 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Start your 7-day free trial
            </h2>
            <p className="mt-4 text-lg text-amber-100">
              No charge for 7 days. Add your card — we’ll only charge you after the trial. Cancel anytime.
            </p>
            <CheckoutButton
              plan="pro"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-amber-700 shadow-lg hover:bg-amber-50 disabled:opacity-70"
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

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  plan,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  plan: "starter" | "pro" | "team";
  highlighted: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-6 sm:p-8 ${
        highlighted
          ? "border-amber-500 bg-white shadow-lg ring-2 ring-amber-500/20"
          : "border-stone-200 bg-white"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-600 px-3 py-0.5 text-xs font-semibold text-white">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-bold text-stone-900">{name}</h3>
      <p className="mt-1 text-sm text-stone-600">{description}</p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-stone-900">£{price}</span>
        <span className="text-stone-500">/month</span>
      </div>
      <p className="mt-2 text-xs text-stone-500">7-day free trial, then £{price}/mo</p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
            <span className="mt-0.5 text-amber-600" aria-hidden>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <CheckoutButton
        plan={plan}
        className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold disabled:opacity-70 ${
          highlighted
            ? "bg-amber-600 text-white hover:bg-amber-700"
            : "border-2 border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
        }`}
      >
        {cta}
      </CheckoutButton>
    </div>
  );
}

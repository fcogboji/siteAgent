import Link from "next/link";
import { Footer } from "@/components/footer";

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
        {num}
      </span>
      <h3 className="mt-2 font-semibold text-stone-800">{title}</h3>
      <p className="mt-1 text-sm text-stone-600">{desc}</p>
    </div>
  );
}

export function LandingView() {
  return (
    <>
      <div className="mx-auto max-w-2xl space-y-10 py-8 sm:max-w-4xl">
        <section className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Never lose money to job disputes again.
          </h1>
          <p className="mt-3 text-stone-600">
            Take timestamped photos, capture signatures, and generate a professional evidence report in seconds.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary-hover active:scale-[0.98]"
            >
              Start 7-day free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-stone-300 bg-white px-6 text-base font-semibold text-stone-700 hover:bg-stone-50 active:scale-[0.98]"
            >
              View pricing
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 text-base font-medium text-stone-600 hover:text-stone-900 active:scale-[0.98]"
            >
              Sign in
            </Link>
          </div>
        </section>
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-800">Why trades lose money</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-stone-600">
            <li>Clients deny extra work</li>
            <li>Property damage claims</li>
            <li>Verbal agreements disappear</li>
            <li>Snag disputes delay payment</li>
            <li>No written proof of completion</li>
          </ul>
        </section>
        <section className="grid gap-4 sm:grid-cols-3">
          <Step num={1} title="Capture evidence" desc="Photos stamped with time & location" />
          <Step num={2} title="Get sign-off" desc="Client signs on your phone" />
          <Step num={3} title="Generate report" desc="Share a professional proof document" />
        </section>
        <section className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
          <h2 className="font-bold text-stone-900">7-day free trial</h2>
          <p className="mt-2 text-sm text-stone-600">
            Card required. We charge automatically after 7 days. Cancel anytime.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-block font-semibold text-primary hover:text-primary-hover"
          >
            Get started →
          </Link>
        </section>
      </div>
      <Footer />
    </>
  );
}

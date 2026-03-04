import Link from "next/link";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "How it works — Site Agent",
  description: "Capture evidence, get sign-off, and generate professional proof-of-work reports with Site Agent.",
};

function Step({
  num,
  title,
  desc,
  children,
}: {
  num: number;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
        {num}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-stone-600">{desc}</p>
      {children && <div className="mt-4 text-sm text-stone-600">{children}</div>}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">How Site Agent works</h1>
        <p className="mt-3 text-stone-600">
          Three simple steps to proof your work, prevent disputes, and get paid.
        </p>

        <section className="mt-12 grid gap-6 sm:grid-cols-1">
          <Step
            num={1}
            title="Capture evidence"
            desc="Create a job, then add photos with timestamps and optional location. Use tags like Condition, Before, and After to organise evidence for damage protection and completion."
          >
            <p>Photos are stamped with date, time, and (if allowed) location so they can’t be disputed. Add notes to each photo for context.</p>
          </Step>

          <Step
            num={2}
            title="Get sign-off"
            desc="Capture your own signature on the job, and optionally send a client sign-off link so the client can view the report and sign without creating an account."
          >
            <p>Contractor signature is captured on your device. Client sign-off is a read-only link; once they sign, the report is locked for proof.</p>
          </Step>

          <Step
            num={3}
            title="Generate & share report"
            desc="Generate a professional PDF report with all photos, notes, and signatures. Share via link (SMS, WhatsApp, or copy link) or download the PDF to send to the client or insurer."
          >
            <p>Reports are grouped by Condition, Before, After, and other photos. You can open the report in the browser (with clickable photos) or download the PDF.</p>
          </Step>
        </section>

        <section className="mt-12 rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
          <h2 className="font-bold text-stone-900">Ready to get started?</h2>
          <p className="mt-2 text-sm text-stone-600">
            7-day free trial. No charge until the trial ends. Cancel anytime.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-stone-300 bg-white px-6 text-base font-semibold text-stone-700 hover:bg-stone-50"
            >
              View pricing
            </Link>
          </div>
        </section>

        <p className="mt-12">
          <Link href="/" className="text-primary hover:underline">← Back to home</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

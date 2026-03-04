import Link from "next/link";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Privacy policy — Site Agent",
  description: "How Site Agent collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-stone-900">Privacy policy</h1>
        <p className="mt-2 text-sm text-stone-500">
          Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-stone mt-8 max-w-none text-stone-700">
          <h2 className="mt-8 text-lg font-semibold text-stone-900">1. Who we are</h2>
          <p>
            Site Agent provides proof-of-work tools for trades. This policy explains how we collect, use, and protect your personal data.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">2. Data we collect</h2>
          <p>We may collect: account information (email, name, company); job and report data (titles, photos, signatures); payment info via our provider; usage data; and cookies (see our Cookies page).</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">3. How we use your data</h2>
          <p>We use data to provide and improve the Service, process payments, send service messages, and comply with law.</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">4. Legal basis</h2>
          <p>We process data to perform our contract, comply with law, or for legitimate interests. Where we rely on consent, you can withdraw it at any time.</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">5. Sharing</h2>
          <p>We may share data with service providers, regulators, or in connection with a merger. We do not sell your personal data.</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">6. Your rights</h2>
          <p>You may have rights to access, correct, delete, or restrict your data. Contact us to exercise them.</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">7. Contact</h2>
          <p>For privacy questions, contact us via the details on our website or in the app.</p>
        </div>

        <p className="mt-12">
          <Link href="/" className="text-primary hover:underline">← Back to home</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

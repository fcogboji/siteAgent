import Link from "next/link";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Terms & conditions — Site Agent",
  description: "Terms and conditions of use for Site Agent.",
};

export default function TermsPage() {
  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-stone-900">Terms & conditions</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="prose prose-stone mt-8 max-w-none text-stone-700">
          <h2 className="mt-8 text-lg font-semibold text-stone-900">1. Agreement to terms</h2>
          <p>
            By accessing or using Site Agent (“the Service”), you agree to be bound by these Terms & conditions. If you do not agree, do not use the Service.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">2. Description of service</h2>
          <p>
            Site Agent provides tools for capturing timestamped photos, signatures, and generating proof-of-work reports for trades and contractors. The Service is offered on a subscription basis with a free trial period.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">3. Your account and use</h2>
          <p>
            You must provide accurate information when registering. You are responsible for keeping your account secure and for all activity under your account. You must use the Service in compliance with applicable laws and must not use it for any illegal or fraudulent purpose.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">4. Subscription and payment</h2>
          <p>
            Paid plans are billed in advance (monthly or annually). The free trial allows you to use the Service for a limited period; we may charge your payment method automatically when the trial ends unless you cancel. Refunds are at our discretion unless required by law.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">5. Intellectual property</h2>
          <p>
            The Service, including its design, code, and branding, is owned by us or our licensors. We grant you a limited licence to use the Service for your own business use. You retain ownership of content you create (e.g. photos, reports); you grant us the rights we need to operate and improve the Service.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">6. Limitation of liability</h2>
          <p>
            The Service is provided “as is”. We do not guarantee uninterrupted or error-free operation. To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages, or for loss of data or business. Our total liability is limited to the amount you paid us in the 12 months before the claim.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">7. Termination</h2>
          <p>
            You may cancel your subscription at any time. We may suspend or terminate your access if you breach these terms or for other operational or legal reasons, with notice where practicable.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">8. Changes</h2>
          <p>
            We may update these terms from time to time. We will post the updated terms on this page and, for material changes, we may notify you by email or in-app notice. Continued use of the Service after changes constitutes acceptance.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">9. Contact</h2>
          <p>
            For questions about these terms, contact us via the details on our website or in the app.
          </p>
        </div>

        <p className="mt-12">
          <Link href="/" className="text-primary hover:underline">← Back to home</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

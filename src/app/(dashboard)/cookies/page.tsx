import Link from "next/link";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cookies — Site Agent",
  description: "How Site Agent uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-stone-900">Cookies</h1>
        <p className="mt-2 text-sm text-stone-500">
          Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-stone mt-8 max-w-none text-stone-700">
          <h2 className="mt-8 text-lg font-semibold text-stone-900">1. What are cookies?</h2>
          <p>Cookies are small text files stored on your device. They help the site remember preferences and keep you signed in.</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">2. How we use cookies</h2>
          <p>We use cookies for: strictly necessary (sign-in, security); preferences (e.g. cookie consent so we do not show the banner again); and analytics to improve the product.</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">3. Cookie consent</h2>
          <p>When you first visit, we show a cookie notice. If you accept, we store your choice so we do not show it again for a set period (e.g. once per day).</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">4. Managing cookies</h2>
          <p>You can control or delete cookies in your browser. Blocking cookies may affect how the Service works.</p>

          <h2 className="mt-8 text-lg font-semibold text-stone-900">5. More</h2>
          <p>See our <Link href="/privacy" className="text-primary hover:underline">Privacy policy</Link> for how we handle data. Contact us via the website or app for questions.</p>
        </div>

        <p className="mt-12">
          <Link href="/" className="text-primary hover:underline">← Back to home</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

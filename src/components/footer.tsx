import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/home" className="flex items-center gap-2 text-stone-900">
              <Logo className="h-10 w-10 shrink-0" />
              <p className="text-2xl font-bold">Site Agent</p>
            </Link>
            <p className="mt-2 text-sm text-stone-600">
              Proof your work. Prevent disputes. Get paid.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/how-it-works" className="text-sm text-stone-600 hover:text-stone-900">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-stone-600 hover:text-stone-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/home" className="text-sm text-stone-600 hover:text-stone-900">
                  Home
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-stone-600 hover:text-stone-900">
                  Terms & conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-stone-600 hover:text-stone-900">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-stone-600 hover:text-stone-900">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-stone-200 pt-8 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Site Agent. Built for UK trades.
        </div>
      </div>
    </footer>
  );
}

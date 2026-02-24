import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-stone-900">SiteProof</p>
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
                <Link href="/pricing" className="text-sm text-stone-600 hover:text-stone-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">
                  Features
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
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-stone-200 pt-8 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} SiteProof. Built for UK trades.
        </div>
      </div>
    </footer>
  );
}

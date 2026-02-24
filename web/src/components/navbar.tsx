import { SignedIn, SignedOut } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

type NavbarProps = { isAdmin?: boolean };

export function Navbar({ isAdmin }: NavbarProps = {}) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-stone-900">
          SiteProof
        </Link>
        <nav className="hidden items-center gap-8 sm:flex" aria-label="Main">
          <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-900">
            Home
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-stone-600 hover:text-stone-900">
            Pricing
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-amber-700 hover:text-amber-800">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link
              href="/"
              className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 sm:inline-block"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Start free trial
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

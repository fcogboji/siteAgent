"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";

type NavbarProps = { isAdmin?: boolean; showTeamLink?: boolean; hasSubscription?: boolean; isSignedIn?: boolean };

export function Navbar({ isAdmin, showTeamLink, hasSubscription, isSignedIn }: NavbarProps = {}) {
  const firstLinkLabel = isSignedIn ? "Dashboard" : "Home";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex min-h-[56px] max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center gap-2 text-lg font-bold text-stone-900"
        >
          <Logo className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
          <span className="truncate text-xl sm:text-2xl">Site Agent</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 sm:flex sm:gap-6" aria-label="Main">
          <Link
            href="/"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            {firstLinkLabel}
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            Pricing
          </Link>
          {showTeamLink && (
            <Link
              href="/team"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            >
              Team
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 hover:text-primary-hover"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hidden min-h-[44px] items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover sm:inline-flex"
            >
              Start free trial
            </Link>
          </SignedOut>
          {/* Hamburger after user profile on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 active:bg-stone-200 sm:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="border-t border-stone-200 bg-white px-4 py-4 sm:hidden"
          aria-label="Main mobile"
        >
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block min-h-[48px] rounded-xl px-4 py-3.5 text-base font-medium text-stone-700 active:bg-stone-100"
              >
                {firstLinkLabel}
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="block min-h-[48px] rounded-xl px-4 py-3.5 text-base font-medium text-stone-700 active:bg-stone-100"
              >
                Pricing
              </Link>
            </li>
            {showTeamLink && (
              <li>
                <Link
                  href="/team"
                  onClick={() => setMobileOpen(false)}
                  className="block min-h-[48px] rounded-xl px-4 py-3.5 text-base font-medium text-stone-700 active:bg-stone-100"
                >
                  Team
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block min-h-[48px] rounded-xl px-4 py-3.5 text-base font-medium text-primary active:bg-primary/10"
                >
                  Admin
                </Link>
              </li>
            )}
            {!isSignedIn && (
              <>
                <li className="mt-2 border-t border-stone-200 pt-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="block min-h-[48px] rounded-xl px-4 py-3.5 text-base font-medium text-stone-700 active:bg-stone-100"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="block min-h-[48px] rounded-xl bg-primary px-4 py-3.5 text-center text-base font-semibold text-white active:bg-primary-hover"
                  >
                    Start free trial
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}

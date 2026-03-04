"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const STORAGE_KEY_ACCEPTED = "siteagent_cookie_consent_accepted";
const STORAGE_KEY_LAST_SHOWN = "siteagent_cookie_consent_last_shown";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = localStorage.getItem(STORAGE_KEY_ACCEPTED) === "true";
    const lastShown = localStorage.getItem(STORAGE_KEY_LAST_SHOWN);
    const today = getToday();
    if (accepted) {
      setVisible(false);
      return;
    }
    if (lastShown === today) {
      setVisible(false);
      return;
    }
    setVisible(true);
    // Defer writing so React Strict Mode's double-invoke doesn't hide the banner on second run
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_LAST_SHOWN, today);
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY_ACCEPTED, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-stone-200 bg-white px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-700">
          We use cookies for sign-in, preferences, and to improve the service. By continuing you agree to our{" "}
          <Link href="/cookies" className="font-medium text-primary hover:underline">
            use of cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/cookies"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Learn more
          </Link>
          <button
            type="button"
            onClick={accept}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

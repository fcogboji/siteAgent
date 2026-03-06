"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const STORAGE_KEY_ACCEPTED = "siteagent_cookie_consent_accepted";
const STORAGE_KEY_REJECTED = "siteagent_cookie_consent_rejected";
const STORAGE_KEY_LAST_SHOWN = "siteagent_cookie_consent_last_shown";

const COOKIE_BLUE = "#1e3a5f";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = localStorage.getItem(STORAGE_KEY_ACCEPTED) === "true";
    const rejected = localStorage.getItem(STORAGE_KEY_REJECTED) === "true";
    const lastShown = localStorage.getItem(STORAGE_KEY_LAST_SHOWN);
    const today = getToday();
    if (accepted || rejected) {
      setVisible(false);
      return;
    }
    if (lastShown === today) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_LAST_SHOWN, today);
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY_ACCEPTED, "true");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY_REJECTED, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-1/2 z-[60] w-full max-w-xl -translate-x-1/2 rounded-t-2xl border border-stone-200 bg-white px-6 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.5rem))]"
      role="dialog"
      aria-label="Cookie consent"
    >
      <h3 className="text-lg font-bold" style={{ color: COOKIE_BLUE }}>
        We value your privacy.
      </h3>
      <p className="mt-2 text-sm text-stone-600">
        We use cookies to improve your experience on our website and to analyse our web traffic.{" "}
        <Link href="/cookies" className="font-medium hover:underline" style={{ color: COOKIE_BLUE }}>
          Cookie Policy
        </Link>
        {" "}to learn more.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/cookies"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 px-5 text-sm font-semibold transition-colors hover:bg-stone-50"
          style={{ borderColor: COOKIE_BLUE, color: COOKIE_BLUE }}
        >
          Manage cookies
        </Link>
        <button
          type="button"
          onClick={reject}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: COOKIE_BLUE }}
        >
          Reject all cookies
        </button>
        <button
          type="button"
          onClick={accept}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: COOKIE_BLUE }}
        >
          Accept all cookies
        </button>
      </div>
    </div>
  );
}

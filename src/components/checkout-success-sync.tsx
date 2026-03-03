"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** When user returns from Stripe with session_id, sync subscription to DB then clean URL. */
export function CheckoutSuccessSync() {
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || synced.current) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const checkout = params.get("checkout");
    if (checkout !== "success" || !sessionId) return;

    synced.current = true;
    fetch("/api/checkout/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.pathname + url.search);
        router.refresh();
      })
      .catch(() => {
        router.refresh();
      });
  }, [router]);

  return null;
}

"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

type Plan = "starter" | "pro" | "team";

export function CheckoutButton({
  plan,
  children,
  className,
}: {
  plan: Plan;
  children: React.ReactNode;
  className?: string;
}) {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/pricing")}`;
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/sign-in";
          return;
        }
        alert(data.error || "Something went wrong");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isSignedIn) {
    return (
      <Link href="/sign-up" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Taking you to checkout…" : children}
    </button>
  );
}

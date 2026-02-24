"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export function SubscriptionGate({
  hasSubscription,
  children,
}: {
  hasSubscription: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (hasSubscription) return;
    if (pathname === "/pricing") return;
    if (pathname?.startsWith("/admin")) return;
    setShouldRedirect(true);
  }, [hasSubscription, pathname]);

  // Always show pricing/admin content when on those routes (don't gate them)
  if (pathname === "/pricing" || pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }
  if (shouldRedirect && !hasSubscription) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-stone-600">You need an active plan to use the app.</p>
        <Link
          href="/pricing"
          className="rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700"
        >
          Choose a plan
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

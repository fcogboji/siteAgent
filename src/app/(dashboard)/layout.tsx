import { Navbar } from "@/components/navbar";
import { SubscriptionGate } from "@/components/subscription-gate";
import { SuspendedGuard } from "@/components/suspended-guard";
import { CheckoutSuccessSync } from "@/components/checkout-success-sync";
import { Toaster } from "@/components/toast";
import { getCurrentUser, hasActiveSubscription, isAdmin, isTeamMemberOfActiveTeam } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const admin = await isAdmin(user);
  const suspended = !!user?.suspended;
  const hasTeamAccess = user ? await isTeamMemberOfActiveTeam(user.id) : false;
  // Signed-out users see landing; only signed-in users without a plan see the gate
  const hasSubscription = !user ? true : hasActiveSubscription(user.stripeSubscriptionStatus) || hasTeamAccess || admin;

  return (
    <div className="min-h-screen bg-stone-50">
      <Toaster />
      <CheckoutSuccessSync />
      <SuspendedGuard suspended={suspended} />
      <Navbar isAdmin={admin} showTeamLink={!!user && (user.plan === "team" || user.plan === "pro" || hasTeamAccess)} hasSubscription={hasSubscription} isSignedIn={!!user} />
      <SubscriptionGate hasSubscription={hasSubscription}>
        <main className="min-h-[50vh] px-4 py-6 pb-[max(6rem,calc(env(safe-area-inset-bottom)+4rem))] sm:px-6">{children}</main>
      </SubscriptionGate>
    </div>
  );
}

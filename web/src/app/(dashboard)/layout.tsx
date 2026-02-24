import { Navbar } from "@/components/navbar";
import { SubscriptionGate } from "@/components/subscription-gate";
import { getCurrentUser, hasActiveSubscription, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const admin = await isAdmin(user);
  // Signed-out users see landing; only signed-in users without a plan see the gate
  const hasSubscription = !user ? true : hasActiveSubscription(user.stripeSubscriptionStatus) || admin;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar isAdmin={admin} />
      <SubscriptionGate hasSubscription={hasSubscription}>
        <main className="px-4 py-6 pb-24 sm:px-6">{children}</main>
      </SubscriptionGate>
    </div>
  );
}

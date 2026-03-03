import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

/** After checkout, sync subscription from Stripe to DB (fallback if webhook didn’t run). */
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId ?? body.session_id;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const refUserId = session.client_reference_id ?? (session.metadata?.userId as string | undefined);
    if (refUserId && refUserId !== user.id) {
      return NextResponse.json({ error: "Session does not belong to this user" }, { status: 403 });
    }

    if (session.customer) {
      const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const sub = session.subscription;
    if (sub) {
      const subscription = typeof sub === "string" ? await stripe.subscriptions.retrieve(sub) : sub;
      const plan = (session.metadata?.plan as string) || null;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeSubscriptionStatus: subscription.status,
          ...(plan && ["starter", "pro", "team"].includes(plan) ? { plan } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("Checkout sync error:", e);
    }
    return NextResponse.json(
      { error: "Sync failed. Your subscription may still be active; try refreshing." },
      { status: 500 }
    );
  }
}

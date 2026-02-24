import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        if (session.customer && userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer.id,
            },
          });
        }
        if (session.subscription && userId) {
          const sub = await getStripe().subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id
          );
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: sub.id,
              stripeSubscriptionStatus: sub.status,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: sub.status === "active" || sub.status === "trialing" ? sub.id : null,
              stripeSubscriptionStatus: sub.status === "canceled" || sub.status === "unpaid" ? null : sub.status,
            },
          });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (subscriptionId) {
          const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { stripeSubscriptionStatus: "active" },
            });
          }
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("Webhook handler error:", e);
    }
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

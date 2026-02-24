import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getStripe, TRIAL_DAYS, getPriceId } from "@/lib/stripe";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan as string;
    if (!plan || !["starter", "pro", "team"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = getPriceId(plan as "starter" | "pro" | "team");
    if (!priceId) {
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          { error: "Price not configured. Set STRIPE_*_PRICE_ID in env." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: "Checkout is not available. Please try later." }, { status: 503 });
    }

    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({ data: { clerkId } });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
      },
      success_url: `${baseUrl}?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=canceled`,
      client_reference_id: user.id,
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: user.email ?? undefined }),
      metadata: {
        userId: user.id,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("Checkout error:", e);
    }
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}

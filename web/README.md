# SiteProof — Proof your work. Prevent disputes. Get paid.

UK-focused site proof app for trades: timestamped photos, notes, client signature, and one-tap professional PDF reports.

## Stack

- **Next.js** (App Router), **TypeScript**, **Tailwind**
- **Clerk** (auth)
- **Prisma** + **Neon** (Postgres)
- **Stripe** (subscriptions with 7-day free trial, card required, auto-charge after trial)
- **Vercel Blob** (optional, for photo storage; falls back to inline images without it)
- **@react-pdf/renderer** (PDF reports)

## Setup

1. **Clone / open** the `web` folder.

2. **Env** — copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL` (e.g. from [Neon](https://neon.tech))
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from [Clerk](https://dashboard.clerk.com)
   - **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID` (create recurring prices in [Stripe Dashboard](https://dashboard.stripe.com/products); use the price IDs).
   - Optional: `BLOB_READ_WRITE_TOKEN` (Vercel Blob) for larger photo uploads; without it, images are stored inline (max ~2MB each).
   - Optional: `NEXT_PUBLIC_APP_URL` for correct checkout redirects and report links (e.g. `https://yoursite.com`).

3. **Database**:
   ```bash
   npm run db:push
   ```
   (If Prisma warns about data loss, run `dotenv -e .env.local -- prisma db push --accept-data-loss`.)

4. **Run**:
   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** — sign up, create a job, add photos, notes, signature, then **Generate report**.

## MVP flow

1. **Create job** (title, client, address).
2. **Add photos** (camera or upload; timestamps stored).
3. **Notes** (per job).
4. **Client signature** (draw on screen + optional name).
5. **Generate report** → shareable link + **Download PDF**.

Public report URL: `/report/[slug]` (no login). PDF: `/api/report/[slug]/pdf`.

## Deploy (Vercel)

1. **Connect** your repo to Vercel and set the **root directory** to `web` (if the app lives in a subfolder).
2. **Environment variables** — In Vercel project → Settings → Environment Variables, add all vars from `.env.example` (use **Production** and **Preview** as needed):
   - `DATABASE_URL`, Clerk keys, Stripe keys and price IDs, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL` (e.g. `https://your-app.vercel.app`).
3. **Database**: run `prisma db push` (or `npm run db:push`) against your production DB before or right after first deploy.
4. **Stripe webhook**: In Stripe Dashboard → Webhooks, add endpoint `https://your-app.vercel.app/api/webhooks/stripe` with events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`; set `STRIPE_WEBHOOK_SECRET` in Vercel to the signing secret.
5. **Clerk**: In Clerk Dashboard, add your production domain to allowed origins and set the production sign-in/sign-up URLs if needed.

## Production & security

- **Security headers** are set in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; `X-Powered-By` is disabled.
- **Secrets**: Never commit `.env` or `.env.local`; only use env vars in Vercel (or your host). API routes and Server Actions do not expose stack traces or internal errors to clients in production.
- **Build**: `npm run build` must pass before deploy. Run it locally to confirm.

## Features added (roadmap)

- **Voice notes** — “Add voice note” in the Notes section uses the browser Speech API (Chrome/Edge) to turn speech into text and append to notes.
- **Photo tags** — Tag photos as **Condition** (damage protection / initial state), **Before**, or **After**. Choose the tag for the *next* photo, or change any photo’s tag via the dropdown on the thumbnail.
- **Reports** — Public report and PDF group photos by tag: “Condition on arrival (damage protection)”, “Before”, “After”, then untagged “Photos”.

## Stripe (7-day trial + billing)

- Pricing page “Start 7-day free trial” creates a Stripe Checkout session (subscription with `trial_period_days: 7`). Card is required; Stripe charges automatically after the trial.
- Webhook at `POST /api/webhooks/stripe` syncs `stripeCustomerId`, `stripeSubscriptionId`, and `stripeSubscriptionStatus` on the User. In Stripe Dashboard → Developers → Webhooks, add endpoint with URL `https://your-domain.com/api/webhooks/stripe` and events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.
- For local testing use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and set `STRIPE_WEBHOOK_SECRET` to the CLI’s signing secret.

## Roadmap (next)

- Team accounts + company branding on reports
- Offline support / PWA
# siteAgent

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/report/(.*)",
  "/api/report/(.*)",
  "/api/webhooks/(.*)",
  "/invite/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?:|js|css|png|jpg|jpeg|gif|ico|svg|woff2?)).*)", "/report/:path*"],
};

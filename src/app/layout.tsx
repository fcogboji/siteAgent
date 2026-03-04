import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

export const dynamic = "force-dynamic";
import "./globals.css";

export const metadata: Metadata = {
  title: "Site Agent — Proof your work. Prevent disputes. Get paid.",
  description:
    "Timestamped photos, signatures, and professional reports for UK trades. Never lose money to job disputes again.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
          <CookieConsentBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}

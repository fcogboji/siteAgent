import { LandingView } from "@/components/landing-view";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Site Agent — Proof your work. Prevent disputes. Get paid.",
  description:
    "Timestamped photos, signatures, and professional reports for UK trades. Never lose money to job disputes again.",
};

export default function LandingPage() {
  return <LandingView />;
}

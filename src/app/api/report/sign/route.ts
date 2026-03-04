import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public API: client signs the report using the one-time token. No auth required. */
export async function POST(request: Request) {
  let body: { token: string; signatureDataUrl: string; signedBy?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, signatureDataUrl, signedBy } = body;
  if (!token || typeof token !== "string" || !signatureDataUrl || typeof signatureDataUrl !== "string") {
    return NextResponse.json({ error: "Missing token or signature" }, { status: 400 });
  }

  if (!signatureDataUrl.startsWith("data:image/") || signatureDataUrl.length < 100) {
    return NextResponse.json({ error: "Invalid signature image" }, { status: 400 });
  }

  const job = await prisma.job.findFirst({
    where: { clientSignToken: token, reportSlug: { not: null } },
    select: { id: true, reportSlug: true, clientSignedAt: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  if (job.clientSignedAt) {
    return NextResponse.json({ error: "Report already signed" }, { status: 400 });
  }

  await prisma.job.update({
    where: { id: job.id },
    data: {
      clientSignatureUrl: signatureDataUrl,
      clientSignedBy: typeof signedBy === "string" ? signedBy.trim() || null : null,
      clientSignedAt: new Date(),
      clientSignToken: null, // one-time use
    },
  });

  return NextResponse.json({
    ok: true,
    reportSlug: job.reportSlug,
    redirectUrl: `/report/${job.reportSlug}`,
  });
}

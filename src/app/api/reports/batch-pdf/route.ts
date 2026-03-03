import { NextResponse } from "next/server";
import { getEffectiveUserIdForJobs } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/reports/batch-pdf?ids=id1,id2,id3 — returns JSON with PDF URLs, or redirects if single job. */
export async function GET(request: Request) {
  const userId = await getEffectiveUserIdForJobs();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ error: "ids required" }, { status: 400 });

  const jobIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);
  if (jobIds.length === 0) return NextResponse.json({ error: "No job IDs" }, { status: 400 });

  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds }, userId },
    select: { id: true, title: true, reportSlug: true },
  });

  const withReports = jobs.filter((j) => j.reportSlug);
  if (withReports.length === 0) return NextResponse.json({ error: "No reports to download" }, { status: 400 });

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://site-agent-three.vercel.app";
  const urls = withReports.map((j) => ({
    jobId: j.id,
    title: j.title,
    url: `${base}/api/report/${j.reportSlug}/pdf`,
  }));

  if (urls.length === 1) {
    return NextResponse.redirect(urls[0].url);
  }
  return NextResponse.json({ urls });
}

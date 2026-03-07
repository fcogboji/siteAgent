import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  title: { fontSize: 18, marginBottom: 8, fontWeight: "bold" },
  subtitle: { fontSize: 11, color: "#666", marginBottom: 20 },
  section: { marginBottom: 16 },
  label: { fontSize: 10, color: "#666", marginBottom: 2 },
  value: { fontSize: 12 },
  photoBlock: { marginBottom: 12 },
  photo: { width: "100%", maxHeight: 200, objectFit: "contain" },
  photoCaption: { fontSize: 10, color: "#666", marginTop: 4 },
  signature: { marginTop: 8, marginBottom: 4 },
  sigImg: { height: 40, width: 200 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 10, color: "#888" },
});

type JobForPdf = NonNullable<
  Awaited<ReturnType<typeof getJobForPdf>>
>;

async function getJobForPdf(slug: string) {
  return prisma.job.findUnique({
    where: { reportSlug: slug },
    include: {
      photos: true,
      signature: true,
      user: {
        include: {
          teamOwned: true,
        },
      },
    },
  });
}

const TAG_ORDER = ["condition", "before", "after", null] as const;

function getFlatPhotoIndexById(job: JobForPdf): Map<string, number> {
  const flat = TAG_ORDER.flatMap((tag) =>
    job.photos.filter((p) => (p.tag ?? null) === tag)
  );
  return new Map(flat.map((p, i) => [p.id, i]));
}

function ReportDocument({
  job,
  reportBaseUrl,
}: {
  job: JobForPdf;
  reportBaseUrl: string;
}) {
  const team = job.user?.teamOwned;
  const companyName = team?.name || job.user?.companyName;
  const logoUrl = team?.logoUrl;
  const companyContact = team?.companyContact;
  const photoIndexById = getFlatPhotoIndexById(job);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {logoUrl && (
          <View style={{ marginBottom: 12 }}>
            <Image src={logoUrl} style={{ width: 80, height: 40, objectFit: "contain" }} />
          </View>
        )}
        <Text style={styles.title}>
          {companyName ? `${companyName} — Proof of work report` : "Proof of work report"}
        </Text>
        <Text style={styles.subtitle}>
          Generated with Site Agent — {format(job.updatedAt, "d MMMM yyyy, HH:mm")}
          {companyContact ? ` · ${companyContact}` : ""}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Job</Text>
          <Text style={styles.value}>{job.title}</Text>
        </View>
        {job.clientName && (
          <View style={styles.section}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{job.clientName}</Text>
          </View>
        )}
        {job.address && (
          <View style={styles.section}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{job.address}</Text>
          </View>
        )}

        {job.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{job.notes}</Text>
          </View>
        )}

        {job.photos.length > 0 &&
          TAG_ORDER.map((tag) => {
            const group = job.photos.filter((p) => (p.tag ?? null) === tag);
            if (group.length === 0) return null;
            const title =
              tag === "condition"
                ? "Condition on arrival (damage protection)"
                : tag === "before"
                  ? "Before"
                  : tag === "after"
                    ? "After"
                    : "Photos";
            return (
              <View key={tag ?? "other"} style={styles.section}>
                <Text style={styles.label}>{title}</Text>
                {group.map((p) => {
                  const flatIndex = photoIndexById.get(p.id);
                  const reportPhotoUrl =
                    typeof flatIndex === "number"
                      ? `${reportBaseUrl}#photo-${flatIndex}`
                      : p.imageUrl;
                  return (
                  <View key={p.id} style={styles.photoBlock}>
                    {(p.imageUrl.startsWith("data:") || p.imageUrl.startsWith("http")) && (
                      <Link src={reportPhotoUrl} wrap={false}>
                        <Image src={p.imageUrl} style={styles.photo} />
                      </Link>
                    )}
                    <Text style={styles.photoCaption}>
                      {format(new Date(p.createdAt), "d MMM yyyy, HH:mm")}
                      {p.note ? ` — ${p.note}` : ""}
                      {p.latitude != null && p.longitude != null
                        ? ` — Location: ${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`
                        : ""}
                    </Text>
                  </View>
                  );
                })}
              </View>
            );
          })}

        {job.signature && (
          <View style={styles.section}>
            <Text style={styles.label}>Signature</Text>
            <View style={styles.signature}>
              <Image src={job.signature.signatureImageUrl} style={styles.sigImg} />
              {job.signature.signedBy && (
                <Text style={styles.value}>— {job.signature.signedBy}</Text>
              )}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          {companyName
            ? `${companyName} · Generated with Site Agent. Proof your work. Prevent disputes. Get paid.`
            : "This report was generated by Site Agent. Proof your work. Prevent disputes. Get paid."}
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const job = await getJobForPdf(slug);
  if (!job) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof _request.url === "string" ? new URL(_request.url).origin : "");
    const reportBaseUrl = `${baseUrl}/report/${slug}`;
    const buffer = await renderToBuffer(
      <ReportDocument job={job} reportBaseUrl={reportBaseUrl} />
    );
    const body = buffer instanceof Buffer ? buffer : Buffer.from(buffer);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="site-agent-report-${slug}.pdf"`,
      },
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error("PDF generation failed:", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

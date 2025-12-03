import { db } from "@/lib/db";

type PlateParams = {
  params: { plate: string };
};

// ==========================
// 1) SEO METADATA DYNAMIC
// ==========================
export async function generateMetadata({ params }: PlateParams) {
  const plate = params.plate.toUpperCase();
  const report = await db.carReport.findFirst({
    where: { plateNumber: plate },
    include: { media: true },
  });

  const img =
    report?.mainImageUrl ||
    report?.media?.[0]?.url ||
    "/svlx.png";

  return {
    title: `${plate} – Thông tin vi phạm`,
    description:
      report?.description?.slice(0, 150) ||
      `Biển số ${plate}`,
    openGraph: {
      title: `${plate} – Thông tin vi phạm`,
      description:
        report?.description?.slice(0, 150) || "",
      images: [{ url: img }],
    },
    alternates: { canonical: `/bien-so/${plate}` },
  };
}

// ==========================
// 2) PAGE + JSON-LD
// ==========================
export default async function PlateDetailPage({
  params,
}: PlateParams) {
  const plate = params.plate.toUpperCase();

  const report = await db.carReport.findFirst({
    where: { plateNumber: plate },
    include: {
      author: true,
      media: true,
      _count: { select: { comments: true } },
    },
  });

  if (!report)
    return (
      <div style={{ padding: 20 }}>
        Không tìm thấy biển số {plate}
      </div>
    );

  // JSON-LD SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${plate} – Báo cáo vi phạm`,
    image:
      report.mainImageUrl ||
      report.media?.[0]?.url ||
      "",
    datePublished: report.createdAt,
    author: {
      "@type": "Person",
      name: report.author?.displayName || "Ẩn danh",
    },
    publisher: {
      "@type": "Organization",
      name: "Súc vật lái xe",
      logo: {
        "@type": "ImageObject",
        url: "https://sucvatlaixe.com/svlx.png",
      },
    },
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <h1>{plate}</h1>

      <p>
        <b>Tiêu đề:</b> {report.title}
      </p>
      <p>
        <b>Mô tả:</b> {report.description}
      </p>

      {/* MEDIA */}
      {report.media?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {report.media.map((m) =>
            m.mediaType === "image" ? (
              <img
                key={m.id}
                src={m.url}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />
            ) : (
              <video
                key={m.id}
                src={m.url}
                controls
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />
            )
          )}
        </div>
      )}

      {/* INFO */}
      <div
        style={{
          marginTop: 20,
          color: "#777",
        }}
      >
        Đăng bởi:{" "}
        {report.author?.displayName || "Ẩn danh"}
        <br />
        Thời gian:{" "}
        {new Date(report.createdAt).toLocaleString(
          "vi-VN"
        )}
        <br />
        Bình luận: {report._count.comments}
      </div>
    </div>
  );
}

import { db } from "@/lib/db";

export default async function sitemap() {
  const reports = await db.carReport.findMany({
    select: { plateNumber: true, createdAt: true },
  });

  const items = reports.map((r) => ({
    url: `https://sucvatlaixe.com/bien-so/${r.plateNumber}`,
    lastModified: r.createdAt,
  }));

  return [
    {
      url: "https://sucvatlaixe.com/",
      lastModified: new Date(),
    },
    ...items,
  ];
}

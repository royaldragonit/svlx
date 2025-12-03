import { db } from "@/lib/db";

export const dynamic = "force-static";

export default async function sitemap() {
  const media = await db.reportMedia.findMany({
    where: { mediaType: "image" },
    select: { url: true, reportId: true },
  });

  return media.map((m) => ({
    loc: `https://sucvatlaixe.com${m.url}`,
    image: {
      loc: `https://sucvatlaixe.com${m.url}`,
    },
  }));
}

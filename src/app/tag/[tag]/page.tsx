import { db } from "@/lib/db";

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = params.tag;

  const reports = await db.carReport.findMany({
    where: { categoryTag: tag },
    include: { media: true },
  });

  return (
    <div style={{ padding:20 }}>
      <h1>Tag: {tag}</h1>

      {reports.map((r) => (
        <div key={r.id} style={{ marginTop:20 }}>
          <a href={`/bien-so/${r.plateNumber}`}>
            <b>{r.title}</b>
          </a>
          <p>{r.description.slice(0, 150)}...</p>
        </div>
      ))}
    </div>
  );
}

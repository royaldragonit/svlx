import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export async function GET() {
  const reports = await db.carReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: true,
      media: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  return NextResponse.json(serializeBigInt(reports));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const media = Array.isArray(body.media) ? body.media : [];
  const mainImage =
    media.find((m: any) => m.kind === "image")?.url ?? body.mainImageUrl ?? null;

  const report = await db.carReport.create({
    data: {
      authorId: body.authorId ?? 1,
      plateNumber: body.plateNumber ?? "UNKNOWN",
      title: body.title,
      description: body.body,
      carType: body.carType ?? "",
      location: body.location ?? "",
      mainImageUrl: mainImage,
      categoryTag: body.tags ?? null,
      media: {
        create: media.map((m: any) => ({
          mediaType: m.kind,
          url: m.url,
        })),
      },
    },
    include: {
      author: true,
      media: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  return NextResponse.json(serializeBigInt(report), { status: 201 });
}

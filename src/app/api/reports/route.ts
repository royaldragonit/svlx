import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const sort = searchParams.get("sort")?.trim() || "latest"; // "latest" | "most_commented"

  const where: any = {};

  if (search) {
    where.OR = [
      { plateNumber: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: any[] = [];

  if (sort === "most_commented") {
    orderBy.push({ comments: { _count: "desc" } });
    orderBy.push({ createdAt: "desc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  const reports = await db.carReport.findMany({
    where,
    orderBy,
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
      // categoryTag bỏ ý nghĩa, có thể để null luôn:
      categoryTag: null,
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

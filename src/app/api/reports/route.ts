import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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
  const sort = searchParams.get("sort")?.trim() || "latest";
  const reportIdParam = searchParams.get("report_id");

  // lấy userId nếu có
  const token = req.cookies.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;
  const currentUserId = payload ? BigInt(payload.userId) : null;

  // nếu có report_id -> chỉ lấy 1
  if (reportIdParam) {
    try {
      const id = BigInt(reportIdParam);

      const report = await db.carReport.findUnique({
        where: { id },
        include: {
          author: true,
          media: true,
          _count: {
            select: { comments: true },
          },
        },
      });

      let result: any[] = [];
      if (report) {
        let likedByCurrentUser = false;

        if (currentUserId) {
          const like = await db.userLike.findUnique({
            where: {
              userId_targetType_targetId: {
                userId: currentUserId,
                targetType: "report",
                targetId: report.id,
              },
            },
          });
          likedByCurrentUser = !!like;
        }

        result = [{ ...report, likedByCurrentUser }];
      }

      return NextResponse.json(serializeBigInt(result));
    } catch {
      return NextResponse.json(serializeBigInt([]));
    }
  }

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

  let result: any[] = reports;

  if (currentUserId && reports.length > 0) {
    const ids = reports.map((r) => r.id);

    const likes = await db.userLike.findMany({
      where: {
        userId: currentUserId,
        targetType: "report",
        targetId: { in: ids },
      },
      select: {
        targetId: true,
      },
    });

    const likedSet = new Set(likes.map((l) => l.targetId.toString()));

    result = reports.map((r) => ({
      ...r,
      likedByCurrentUser: likedSet.has(r.id.toString()),
    }));
  }

  return NextResponse.json(serializeBigInt(result));
}

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

// ================== POINTS + RANK ==================

function calcReportPoint(media: { kind?: string; mediaType?: string }[]): number {
  const hasImage = media.some(
    (m) => m.kind === "image" || m.mediaType === "image"
  );
  const hasVideo = media.some(
    (m) => m.kind === "video" || m.mediaType === "video"
  );

  if (hasImage && hasVideo) return 15;
  if (hasVideo) return 13;
  if (hasImage) return 12;
  return 10;
}

// 4 rank: Bạc < Vàng < Bạch kim < Kim cương
function getRank(points: number): string {
  if (points >= 700) return "Kim cương";
  if (points >= 300) return "Bạch kim";
  if (points >= 100) return "Vàng";
  return "Bạc";
}

// ================== GET LIST / DETAIL ==================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const sort = searchParams.get("sort")?.trim() || "latest";
  const reportIdParam = searchParams.get("report_id");

  const token = req.cookies.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;
  const currentUserId = payload ? BigInt(payload.userId) : null;

  // detail 1 report theo report_id
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

  // list
  const where: any = {};

  if (search) {
    where.OR = [
      { plateNumber: { contains: search.toUpperCase(), mode: "insensitive" } },
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
      authorAvatar: r.author.avatarUrl || "",
      likedByCurrentUser: likedSet.has(r.id.toString()),
    }));
  }

  return NextResponse.json(serializeBigInt(result));
}

// ================== POST TẠO CAR REPORT ==================
type CreateReportBody = {
  title: string;
  body: string;
  tags?: string;
  plateNumber?: string;
  carType?: string;
  location?: string;
  media?: {
    kind: "image" | "video";
    url: string;
    fileName?: string;
  }[];
};

export async function POST(req: NextRequest) {
  try {
    // check auth
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const bodyJson = (await req.json()) as CreateReportBody;

    const title = (bodyJson.title || "").trim();
    const description = (bodyJson.body || "").trim();
    const tags = (bodyJson.tags || "").trim();
    const plateNumber = (bodyJson.plateNumber || "").trim();
    const plateRegex = /^[0-9]{2}[A-Z]-[0-9]{4,5}$/;
    if (!plateRegex.test(plateNumber.toUpperCase())) {
      return NextResponse.json(
        { error: "Biển số không hợp lệ. Định dạng hợp lệ: 51F-12345" },
        { status: 400 }
      );
    }
    const carType = (bodyJson.carType || "").trim();
    const location = (bodyJson.location || "").trim();
    const media = Array.isArray(bodyJson.media) ? bodyJson.media : [];

    if (!title && !description) {
      return NextResponse.json(
        { error: "Tiêu đề hoặc nội dung không được trống" },
        { status: 400 }
      );
    }

    const firstImage = media.find((m) => m.kind === "image");
    const authorId = BigInt(payload.userId);
    const reportPoints = calcReportPoint(media);

    const created = await db.$transaction(async (tx) => {
      const createdReport = await tx.carReport.create({
        data: {
          plateNumber: plateNumber || "", // tạm thời cho phép rỗng
          title,
          description,
          carType: carType || "",
          location: location || "",
          categoryTag: tags || null,
          mainImageUrl: firstImage?.url || null,
          authorId,
          likeCount: 0,
          shareCount: 0,
          media: {
            create: media.map((m) => ({
              mediaType: m.kind,
              url: m.url,
              fileName: m.fileName ?? null,
            })),
          },
        },
        include: {
          author: true,
          media: true,
          _count: { select: { comments: true } },
        },
      });

      // cộng điểm + tăng postCount + cập nhật rank
      const userAfterPoint = await tx.user.update({
        where: { id: authorId },
        data: {
          points: { increment: reportPoints },
          postCount: { increment: 1 },
        },
        select: { points: true },
      });

      const newRank = getRank(userAfterPoint.points);

      await tx.user.update({
        where: { id: authorId },
        data: { rank: newRank },
      });

      return createdReport;
    });

    return NextResponse.json(
      serializeBigInt({
        ...created,
        authorAvatar: created.author?.avatarUrl ?? null,
      }),
      { status: 201 }
    );

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

function calcCommentPoint(hasMedia: boolean, content: string): number {
  const text = content.trim();

  if (!hasMedia && text.length < 3) return 0; // chống spam rác
  if (hasMedia) return 5;
  if (text.length >= 10) return 2;
  return 1;
}

function getRank(points: number): string {
  if (points >= 700) return "Kim cương";
  if (points >= 300) return "Bạch kim";
  if (points >= 100) return "Vàng";
  return "Bạc";
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const content = (body.content || "").toString().trim();
    const media = Array.isArray(body.media) ? body.media : [];

    if (!content && media.length === 0) {
      return NextResponse.json(
        { error: "Nội dung comment trống" },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const reportId = BigInt(id);
    const userId = BigInt(payload.userId);
    const hasMedia = media.length > 0;
    const commentPoints = calcCommentPoint(hasMedia, content);

    const created = await db.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          reportId,
          authorId: userId,
          content,
          media: {
            create: media.map((m: any) => ({
              mediaType: m.kind,
              url: m.url,
              fileName: m.fileName ?? null,
            })),
          },
        },
      });

      if (commentPoints > 0) {
        const userAfterPoint = await tx.user.update({
          where: { id: userId },
          data: {
            points: { increment: commentPoints },
          },
          select: { points: true },
        });

        const newRank = getRank(userAfterPoint.points);

        await tx.user.update({
          where: { id: userId },
          data: { rank: newRank },
        });
      }

      return comment;
    });

    return NextResponse.json(serializeBigInt({ comment: created }), {
      status: 201,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reportId = BigInt(id);

    const list = await db.comment.findMany({
      where: { reportId },
      orderBy: { createdAt: "asc" },
      include: {
        author: true,
        media: true,
      },
    });

    return NextResponse.json(serializeBigInt(list));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const MAX_LIKE_POINTS_PER_REPORT = 30;
const LIKE_POINT = 1;

function getRank(points: number): string {
  if (points >= 700) return "Kim cương";
  if (points >= 300) return "Bạch kim";
  if (points >= 100) return "Vàng";
  return "Bạc";
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await context.params;
    const reportId = BigInt(id);
    const userId = BigInt(payload.userId);

    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.userLike.findUnique({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType: "report",
            targetId: reportId,
          },
        },
      });

      let liked: boolean;
      let likeCount: number;

      if (existing) {
        // DISLIKE
        await tx.userLike.delete({
          where: {
            userId_targetType_targetId: {
              userId,
              targetType: "report",
              targetId: reportId,
            },
          },
        });

        const report = await tx.carReport.update({
          where: { id: reportId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          select: { likeCount: true, authorId: true },
        });

        liked = false;
        likeCount = Math.max(0, report.likeCount);

        // trừ điểm cho tác giả nếu like này nằm trong 30 like đầu
        const beforeCount = likeCount + 1; // count trước khi giảm
        if (
          beforeCount <= MAX_LIKE_POINTS_PER_REPORT &&
          report.authorId !== userId
        ) {
          const userAfterPoint = await tx.user.update({
            where: { id: report.authorId },
            data: {
              points: { decrement: LIKE_POINT },
            },
            select: { points: true },
          });

          const newRank = getRank(userAfterPoint.points);

          await tx.user.update({
            where: { id: report.authorId },
            data: { rank: newRank },
          });
        }
      } else {
        // LIKE
        await tx.userLike.create({
          data: {
            userId,
            targetType: "report",
            targetId: reportId,
          },
        });

        const report = await tx.carReport.update({
          where: { id: reportId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
          select: { likeCount: true, authorId: true },
        });

        liked = true;
        likeCount = report.likeCount;

        // cộng điểm cho tác giả nếu nằm trong 30 like đầu, và không tự like
        if (
          report.likeCount <= MAX_LIKE_POINTS_PER_REPORT &&
          report.authorId !== userId
        ) {
          const userAfterPoint = await tx.user.update({
            where: { id: report.authorId },
            data: {
              points: { increment: LIKE_POINT },
            },
            select: { points: true },
          });

          const newRank = getRank(userAfterPoint.points);

          await tx.user.update({
            where: { id: report.authorId },
            data: { rank: newRank },
          });
        }
      }

      return { liked, likeCount };
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

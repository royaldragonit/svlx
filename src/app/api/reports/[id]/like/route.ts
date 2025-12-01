import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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
          select: { likeCount: true },
        });

        liked = false;
        likeCount = Math.max(0, report.likeCount);
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
          select: { likeCount: true },
        });

        liked = true;
        likeCount = report.likeCount;
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

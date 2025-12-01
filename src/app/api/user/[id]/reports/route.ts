import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const userId = BigInt(id);

    // lấy tất cả bài đăng của user
    const reports = await db.carReport.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        media: true,
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(serializeBigInt(reports));
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

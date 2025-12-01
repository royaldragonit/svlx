import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_k, v) =>
      typeof v === "bigint" ? Number(v) : v
    )
  );
}

export async function GET(_req: Request, ctx: any) {
  const { id } = await ctx.params;
  const userId = Number(id);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      rank: true,
      points: true,
      postCount: true,
      joinedAt: true,
    },
  });

  if (!user)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(serializeBigInt({ user }));
}

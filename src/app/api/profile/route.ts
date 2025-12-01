import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export async function PUT(req: NextRequest) {
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
    const displayName = (body.displayName || "").toString().trim();
    const avatarUrl =
      body.avatarUrl === undefined || body.avatarUrl === null
        ? null
        : String(body.avatarUrl);
    const newPassword = body.newPassword ? String(body.newPassword) : "";
    const confirmPassword = body.confirmPassword
      ? String(body.confirmPassword)
      : "";

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "Mật khẩu nhập lại không khớp" },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Mật khẩu phải >= 6 ký tự" },
          { status: 400 }
        );
      }
    }

    const dataToUpdate: any = {
      displayName,
      avatarUrl,
    };

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      dataToUpdate.passwordHash = hash;
    }

    const user = await db.user.update({
      where: { id: BigInt(payload.userId) },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        rank: true,
      },
    });

    return NextResponse.json(serializeBigInt({ user }));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

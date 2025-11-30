import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=facebook_error");
  }

  const clientId = process.env.FACEBOOK_APP_ID || "";
  const clientSecret = process.env.FACEBOOK_APP_SECRET || "";
  const redirectUri = process.env.FACEBOOK_OAUTH_REDIRECT_URI || "";

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch(
    `https://graph.facebook.com/v12.0/oauth/access_token?${tokenParams.toString()}`,
    { method: "GET" }
  );

  if (!tokenRes.ok) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=facebook_error");
  }

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token as string | undefined;
  if (!accessToken) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=facebook_error");
  }

  const profileRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(
      accessToken
    )}`
  );

  if (!profileRes.ok) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=facebook_error");
  }

  const profile = await profileRes.json();
  const email = profile.email as string | undefined;
  const name = (profile.name as string | undefined) || "Người dùng Facebook";
  const picture =
    profile.picture?.data?.url && typeof profile.picture.data.url === "string"
      ? (profile.picture.data.url as string)
      : undefined;

  if (!email) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=facebook_error");
  }

  const user = await db.user.upsert({
    where: { email },
    update: {
      displayName: name,
      avatarUrl: picture || undefined,
    },
    create: {
      email,
      passwordHash: "",
      displayName: name,
      avatarUrl: picture || undefined,
      rank: "Bạc",
    },
  });

  const secret = process.env.JWT_SECRET || "secret";
  const token = jwt.sign(
    { userId: Number(user.id), email: user.email },
    secret,
    { expiresIn: "7d" }
  );

  const redirectTo = process.env.OAUTH_SUCCESS_REDIRECT || "/";
  const res = NextResponse.redirect(redirectTo);

  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

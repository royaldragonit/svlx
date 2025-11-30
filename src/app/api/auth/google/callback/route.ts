import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=google_error");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || "";
  const tokenEndpoint = "https://oauth2.googleapis.com/token";

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=google_error");
  }

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token as string | undefined;
  if (!accessToken) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=google_error");
  }

  const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userinfoRes.ok) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=google_error");
  }

  const profile = await userinfoRes.json();
  const email = profile.email as string | undefined;
  const name = (profile.name as string | undefined) || "Người dùng Google";
  const picture = profile.picture as string | undefined;

  if (!email) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=google_error");
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

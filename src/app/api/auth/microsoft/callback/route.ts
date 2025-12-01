import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=microsoft_error");
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID || "";
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || "";
  const redirectUri = process.env.MICROSOFT_OAUTH_REDIRECT_URI || "";
  const tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=microsoft_error");
  }

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token as string | undefined;
  if (!accessToken) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=microsoft_error");
  }

  const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!graphRes.ok) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=microsoft_error");
  }

  const profile = await graphRes.json();
  const email =
    (profile.mail as string | undefined) ||
    (profile.userPrincipalName as string | undefined);
  const name = (profile.displayName as string | undefined) || "Người dùng Microsoft";

  if (!email) {
    return NextResponse.redirect((process.env.OAUTH_SUCCESS_REDIRECT || "/") + "?oauth=microsoft_error");
  }

  const user = await db.user.upsert({
    where: { email },
    update: {
      displayName: name,
    },
    create: {
      email,
      passwordHash: "",
      displayName: name,
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

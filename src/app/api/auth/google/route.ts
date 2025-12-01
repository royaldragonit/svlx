import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const base = "https://accounts.google.com/o/oauth2/v2/auth";
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || "";
  const scope = [
    "openid",
    "email",
    "profile",
  ].join(" ");
  console.log(" process.env.GOOGLE_OAUTH_REDIRECT_URI", process.env.GOOGLE_OAUTH_REDIRECT_URI)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(`${base}?${params.toString()}`);
}

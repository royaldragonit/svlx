import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const base = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
  const clientId = process.env.MICROSOFT_CLIENT_ID || "";
  const redirectUri = process.env.MICROSOFT_OAUTH_REDIRECT_URI || "";
  const scope = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "User.Read",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "query",
    scope,
  });

  return NextResponse.redirect(`${base}?${params.toString()}`);
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const base = "https://www.facebook.com/v12.0/dialog/oauth";
  const clientId = process.env.FACEBOOK_APP_ID || "";
  const redirectUri = process.env.FACEBOOK_OAUTH_REDIRECT_URI || "";
  const scope = ["email", "public_profile"].join(",");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
  });

  return NextResponse.redirect(`${base}?${params.toString()}`);
}

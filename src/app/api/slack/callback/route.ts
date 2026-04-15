import { NextResponse, type NextRequest } from "next/server";
import { encryptToken } from "@/lib/slack-oauth";

// Handles the OAuth callback from Slack — exchanges code for token, stores in cookie
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/integrations?slack=error", request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/slack/callback`,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("Slack OAuth error:", data.error);
      return NextResponse.redirect(
        new URL("/integrations?slack=error", request.url)
      );
    }

    // The user token is in authed_user.access_token for user-scoped tokens
    const token = data.authed_user?.access_token ?? data.access_token;

    if (!token) {
      return NextResponse.redirect(
        new URL("/integrations?slack=error", request.url)
      );
    }

    // Encrypt and store in HTTP-only cookie
    const encrypted = encryptToken(token);
    const response = NextResponse.redirect(
      new URL("/integrations?slack=connected", request.url)
    );

    response.cookies.set("aura_slack_token", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // 90 days
    });

    return response;
  } catch (err) {
    console.error("Slack callback error:", err);
    return NextResponse.redirect(
      new URL("/integrations?slack=error", request.url)
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { encrypt, exchangeOutlookCode, OUTLOOK_COOKIE_NAME } from "@/lib/secondary-auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/integrations?outlook=error", request.url)
    );
  }

  const refreshToken = await exchangeOutlookCode(code);
  if (!refreshToken) {
    return NextResponse.redirect(
      new URL("/integrations?outlook=error", request.url)
    );
  }

  const response = NextResponse.redirect(
    new URL("/integrations?outlook=connected", request.url)
  );
  response.cookies.set(OUTLOOK_COOKIE_NAME, encrypt(refreshToken), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
  return response;
}

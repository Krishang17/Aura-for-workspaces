import { NextResponse } from "next/server";
import { buildSlackAuthUrl } from "@/lib/slack-oauth";

// Redirects the user to Slack's OAuth consent screen
export async function GET() {
  const url = buildSlackAuthUrl();
  return NextResponse.redirect(url);
}

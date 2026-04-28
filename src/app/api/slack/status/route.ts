import { NextResponse } from "next/server";
import { getSlackToken } from "@/lib/slack-oauth";
import { getSlackProfile } from "@/lib/slack";

// Returns whether Slack is connected and basic profile info
export async function GET() {
  const token = await getSlackToken();

  if (!token) {
    return NextResponse.json({ connected: false });
  }

  const profile = await getSlackProfile(token);

  if (!profile) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    user: profile.name,
    team: profile.team,
  });
}

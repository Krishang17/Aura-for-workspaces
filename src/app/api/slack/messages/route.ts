import { NextResponse } from "next/server";
import { getSlackToken } from "@/lib/slack-oauth";
import { fetchSlackMessages } from "@/lib/slack";

export async function GET() {
  const token = await getSlackToken();

  if (!token) {
    return NextResponse.json(
      { error: "Slack not connected" },
      { status: 401 }
    );
  }

  try {
    const messages = await fetchSlackMessages(token, 30);
    return NextResponse.json({ messages });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch Slack messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

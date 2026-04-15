import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchGmailMessages, getGmailUnreadCount } from "@/lib/gmail";
import { fetchOutlookMessages, getOutlookUnreadCount } from "@/lib/outlook";

// Unified email endpoint — works for both Gmail and Outlook
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    if (session.provider === "google") {
      const [messages, unreadCount] = await Promise.all([
        fetchGmailMessages(session.accessToken, 20),
        getGmailUnreadCount(session.accessToken),
      ]);
      return NextResponse.json({
        messages,
        unreadCount,
        provider: "gmail",
      });
    }

    if (session.provider === "microsoft") {
      const [messages, unreadCount] = await Promise.all([
        fetchOutlookMessages(session.accessToken, 20),
        getOutlookUnreadCount(session.accessToken),
      ]);
      return NextResponse.json({
        messages,
        unreadCount,
        provider: "outlook",
      });
    }

    return NextResponse.json(
      { error: "No email provider connected. Sign in with Google or Microsoft." },
      { status: 400 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchGmailMessages, getGmailUnreadCount, type GmailMessage } from "@/lib/gmail";
import { fetchOutlookMessages, getOutlookUnreadCount, type OutlookMessage } from "@/lib/outlook";
import { getOutlookAccessToken } from "@/lib/secondary-auth";

type AnyMessage = GmailMessage | OutlookMessage;

// Unified email endpoint — merges the primary signed-in provider with any
// secondary connected accounts (e.g. Outlook connected alongside Gmail).
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const messages: AnyMessage[] = [];
  const sources: string[] = [];
  let unreadCount = 0;
  let primaryProvider = "";

  try {
    // ── Primary provider (from sign-in) ──
    if (session.provider === "google") {
      const [gmail, unread] = await Promise.all([
        fetchGmailMessages(session.accessToken, 20),
        getGmailUnreadCount(session.accessToken),
      ]);
      messages.push(...gmail);
      unreadCount += unread;
      sources.push("gmail");
      primaryProvider = "gmail";
    } else if (session.provider === "microsoft") {
      const [outlook, unread] = await Promise.all([
        fetchOutlookMessages(session.accessToken, 20),
        getOutlookUnreadCount(session.accessToken),
      ]);
      messages.push(...outlook);
      unreadCount += unread;
      sources.push("outlook");
      primaryProvider = "outlook";
    }

    // ── Secondary: Outlook connected independently (only if not already primary) ──
    if (session.provider !== "microsoft") {
      const outlookToken = await getOutlookAccessToken();
      if (outlookToken) {
        try {
          const [outlook, unread] = await Promise.all([
            fetchOutlookMessages(outlookToken, 20),
            getOutlookUnreadCount(outlookToken),
          ]);
          messages.push(...outlook);
          unreadCount += unread;
          sources.push("outlook");
        } catch (e) {
          console.error("Secondary Outlook fetch failed:", e);
        }
      }
    }

    // Merge: newest first across all sources
    messages.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      messages,
      unreadCount,
      provider: primaryProvider,
      sources,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

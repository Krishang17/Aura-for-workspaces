import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  fetchGoogleCalendar,
  fetchOutlookCalendar,
  type CalendarEvent,
} from "@/lib/calendar";
import { getOutlookAccessToken } from "@/lib/secondary-auth";

// Unified calendar — merges the primary provider's events with any secondary
// connected account (e.g. Outlook alongside Google).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const events: CalendarEvent[] = [];
  let primaryProvider = "";

  try {
    if (session.provider === "google") {
      events.push(...(await fetchGoogleCalendar(session.accessToken)));
      primaryProvider = "google";
    } else if (session.provider === "microsoft") {
      events.push(...(await fetchOutlookCalendar(session.accessToken)));
      primaryProvider = "outlook";
    }

    // Secondary Outlook calendar (if connected and not already primary)
    if (session.provider !== "microsoft") {
      const outlookToken = await getOutlookAccessToken();
      if (outlookToken) {
        try {
          events.push(...(await fetchOutlookCalendar(outlookToken)));
        } catch (e) {
          console.error("Secondary Outlook calendar fetch failed:", e);
        }
      }
    }

    // Sort chronologically
    events.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return NextResponse.json({ events, provider: primaryProvider });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch calendar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

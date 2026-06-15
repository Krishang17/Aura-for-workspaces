import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchGoogleCalendar, fetchOutlookCalendar } from "@/lib/calendar";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    if (session.provider === "google") {
      const events = await fetchGoogleCalendar(session.accessToken);
      return NextResponse.json({ events, provider: "google" });
    }
    if (session.provider === "microsoft") {
      const events = await fetchOutlookCalendar(session.accessToken);
      return NextResponse.json({ events, provider: "outlook" });
    }
    return NextResponse.json(
      { error: "No calendar provider connected" },
      { status: 400 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch calendar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

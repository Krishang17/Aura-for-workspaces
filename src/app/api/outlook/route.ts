import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchOutlookMessages, getOutlookUnreadCount } from "@/lib/outlook";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.provider !== "microsoft") {
    return NextResponse.json(
      { error: "Outlook requires Microsoft sign-in" },
      { status: 400 }
    );
  }

  try {
    const [messages, unreadCount] = await Promise.all([
      fetchOutlookMessages(session.accessToken, 20),
      getOutlookUnreadCount(session.accessToken),
    ]);

    return NextResponse.json({ messages, unreadCount });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch Outlook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

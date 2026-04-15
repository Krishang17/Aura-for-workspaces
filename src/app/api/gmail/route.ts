import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchGmailMessages, getGmailUnreadCount } from "@/lib/gmail";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  if (session.provider !== "google") {
    return NextResponse.json(
      { error: "Gmail requires Google sign-in" },
      { status: 400 }
    );
  }

  try {
    const [messages, unreadCount] = await Promise.all([
      fetchGmailMessages(session.accessToken, 20),
      getGmailUnreadCount(session.accessToken),
    ]);

    return NextResponse.json({ messages, unreadCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch Gmail";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchGmailMessage } from "@/lib/gmail";
import { fetchOutlookMessage } from "@/lib/outlook";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (session.provider === "google") {
      const message = await fetchGmailMessage(session.accessToken, id);
      return NextResponse.json({ message });
    }
    if (session.provider === "microsoft") {
      const message = await fetchOutlookMessage(session.accessToken, id);
      return NextResponse.json({ message });
    }
    return NextResponse.json(
      { error: "No email provider connected" },
      { status: 400 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

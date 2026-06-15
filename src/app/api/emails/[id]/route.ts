import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchGmailMessage } from "@/lib/gmail";
import { fetchOutlookMessage } from "@/lib/outlook";
import { getOutlookAccessToken } from "@/lib/secondary-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  // The list view tells us which provider the email came from
  const source = request.nextUrl.searchParams.get("source");

  try {
    if (source === "gmail" || (!source && session.provider === "google")) {
      const message = await fetchGmailMessage(session.accessToken, id);
      return NextResponse.json({ message });
    }

    if (source === "outlook" || (!source && session.provider === "microsoft")) {
      // Use the primary Microsoft token, or the secondary Outlook token
      const token =
        session.provider === "microsoft"
          ? session.accessToken
          : await getOutlookAccessToken();
      if (!token) {
        return NextResponse.json(
          { error: "Outlook not connected" },
          { status: 400 }
        );
      }
      const message = await fetchOutlookMessage(token, id);
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

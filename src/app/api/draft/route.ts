import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { generateReplyDraft } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: { from?: string; subject?: string; body?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { draft, error } = await generateReplyDraft({
    userName: session.user?.name ?? "the user",
    from: payload.from ?? "",
    subject: payload.subject ?? "",
    body: payload.body ?? "",
  });

  if (error) {
    return NextResponse.json({ error }, { status: 502 });
  }

  return NextResponse.json({ draft });
}

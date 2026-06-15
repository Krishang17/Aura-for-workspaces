import { NextResponse } from "next/server";
import { isOutlookConnected } from "@/lib/secondary-auth";

export async function GET() {
  const connected = await isOutlookConnected();
  return NextResponse.json({ connected });
}

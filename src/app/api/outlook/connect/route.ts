import { NextResponse } from "next/server";
import { buildOutlookConnectUrl } from "@/lib/secondary-auth";

// Redirects the user to Microsoft's OAuth consent screen to connect Outlook
// as a secondary account (independent of the primary NextAuth sign-in).
export async function GET() {
  return NextResponse.redirect(buildOutlookConnectUrl());
}

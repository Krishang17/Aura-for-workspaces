// Independent OAuth for connecting a SECONDARY account (e.g. Outlook when
// signed in with Google). Stores only the refresh token in an encrypted,
// HTTP-only cookie; access tokens are minted on demand.

import { cookies } from "next/headers";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET ?? "fallback-key-for-dev";
const OUTLOOK_COOKIE = "aura_outlook_rt";

const OUTLOOK_SCOPES =
  "openid profile email offline_access User.Read Mail.Read Calendars.Read";

function getKey() {
  return crypto.scryptSync(ENCRYPTION_KEY, "aura-secondary-salt", 32);
}

export function encrypt(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  let enc = cipher.update(value, "utf8", "hex");
  enc += cipher.final("hex");
  return iv.toString("hex") + ":" + enc;
}

export function decrypt(data: string): string {
  const [ivHex, enc] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
  let dec = decipher.update(enc, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

// ── Outlook connect (secondary) ──

export function buildOutlookConnectUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/outlook/callback`,
    response_mode: "query",
    scope: OUTLOOK_SCOPES,
    prompt: "consent",
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeOutlookCode(
  code: string
): Promise<string | null> {
  const res = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/outlook/callback`,
        scope: OUTLOOK_SCOPES,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("Outlook code exchange failed:", data);
    return null;
  }
  return data.refresh_token ?? null;
}

// Mint a fresh access token from the stored refresh token
export async function getOutlookAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(OUTLOOK_COOKIE);
  if (!cookie) return null;

  let refreshToken: string;
  try {
    refreshToken = decrypt(cookie.value);
  } catch {
    return null;
  }

  const res = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: OUTLOOK_SCOPES,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("Outlook token refresh failed:", data);
    return null;
  }
  return data.access_token ?? null;
}

export async function isOutlookConnected(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(OUTLOOK_COOKIE);
}

export const OUTLOOK_COOKIE_NAME = OUTLOOK_COOKIE;

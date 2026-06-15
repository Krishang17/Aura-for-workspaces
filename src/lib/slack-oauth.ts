import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "aura_slack_token";
const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET ?? "fallback-key-for-dev";

function getKey() {
  return crypto.scryptSync(ENCRYPTION_KEY, "aura-slack-salt", 32);
}

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptToken(data: string): string {
  const [ivHex, encrypted] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function getSlackToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;
  try {
    return decryptToken(cookie.value);
  } catch {
    return null;
  }
}

export function buildSlackAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    // Request USER token scopes (Aura reads the signed-in user's own
    // channels/DMs) rather than bot scopes — the app has no bot user.
    user_scope:
      "channels:read,channels:history,groups:read,groups:history,im:read,im:history,mpim:read,mpim:history,users:read",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/slack/callback`,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

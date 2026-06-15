// Gmail API helper — fetches real emails using the user's OAuth access token

export interface GmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  hasAttachment: boolean;
  labels: string[];
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessageRaw {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload: {
    headers: GmailHeader[];
    parts?: { filename?: string }[];
  };
  internalDate: string;
}

function extractHeader(headers: GmailHeader[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function parseFrom(raw: string): { name: string; email: string } {
  // "John Doe <john@example.com>" → { name: "John Doe", email: "john@example.com" }
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].replace(/"/g, "").trim(), email: match[2] };
  return { name: raw, email: raw };
}

function formatDate(internalDate: string): string {
  const date = new Date(parseInt(internalDate, 10));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function fetchGmailMessages(
  accessToken: string,
  maxResults = 20
): Promise<GmailMessage[]> {
  // Step 1: List message IDs from the Primary inbox category only
  // (excludes Promotions, Social, Updates, Forums tabs)
  const query = encodeURIComponent("in:inbox category:primary");
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${query}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`Gmail list failed (${listRes.status}): ${err}`);
  }

  const listData = await listRes.json();
  const messageIds: { id: string }[] = listData.messages ?? [];

  if (messageIds.length === 0) return [];

  // Step 2: Fetch each message in parallel (metadata only — fast)
  const messages = await Promise.all(
    messageIds.map(async ({ id }) => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) return null;
      return res.json() as Promise<GmailMessageRaw>;
    })
  );

  // Step 3: Transform into our format
  return messages
    .filter((m): m is GmailMessageRaw => m !== null)
    .map((m) => {
      const fromRaw = extractHeader(m.payload.headers, "From");
      const { name, email } = parseFrom(fromRaw);

      return {
        id: m.id,
        from: name,
        fromEmail: email,
        subject: extractHeader(m.payload.headers, "Subject") || "(no subject)",
        snippet: m.snippet,
        date: formatDate(m.internalDate),
        unread: m.labelIds?.includes("UNREAD") ?? false,
        hasAttachment:
          m.payload.parts?.some((p) => p.filename && p.filename.length > 0) ?? false,
        labels: m.labelIds ?? [],
      };
    });
}

// ── Full message body (for opening an email) ──

export interface GmailMessageDetail {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  bodyHtml: string;
  bodyText: string;
}

interface GmailPart {
  mimeType?: string;
  filename?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") {
    try {
      return decodeURIComponent(escape(atob(normalized)));
    } catch {
      return atob(normalized);
    }
  }
  return Buffer.from(normalized, "base64").toString("utf-8");
}

// Recursively walk MIME parts to find HTML and plain-text bodies
function extractBodies(part: GmailPart): { html: string; text: string } {
  let html = "";
  let text = "";

  if (part.mimeType === "text/html" && part.body?.data) {
    html += decodeBase64Url(part.body.data);
  } else if (part.mimeType === "text/plain" && part.body?.data) {
    text += decodeBase64Url(part.body.data);
  }

  if (part.parts) {
    for (const child of part.parts) {
      const childBodies = extractBodies(child);
      html += childBodies.html;
      text += childBodies.text;
    }
  }

  return { html, text };
}

export async function fetchGmailMessage(
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetail> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail message fetch failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const headers: GmailHeader[] = data.payload?.headers ?? [];
  const { name, email } = parseFrom(extractHeader(headers, "From"));
  const { html, text } = extractBodies(data.payload ?? {});

  return {
    id: data.id,
    from: name,
    fromEmail: email,
    to: extractHeader(headers, "To"),
    subject: extractHeader(headers, "Subject") || "(no subject)",
    date: extractHeader(headers, "Date"),
    bodyHtml: html,
    bodyText: text,
  };
}

export async function getGmailUnreadCount(accessToken: string): Promise<number> {
  // Count unread messages in the Primary inbox category only
  const query = encodeURIComponent("in:inbox category:primary is:unread");
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.resultSizeEstimate ?? 0;
}

// Microsoft Graph API helper — fetches real Outlook emails using the user's OAuth access token

export interface OutlookMessage {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
  timestamp: number;
  unread: boolean;
  hasAttachment: boolean;
  source: "outlook";
}

interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  isRead: boolean;
  hasAttachments: boolean;
  receivedDateTime: string;
  from?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
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

export async function fetchOutlookMessages(
  accessToken: string,
  maxResults = 20
): Promise<OutlookMessage[]> {
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}&$orderby=receivedDateTime desc&$select=id,subject,bodyPreview,isRead,hasAttachments,receivedDateTime,from`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook fetch failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const messages: GraphMessage[] = data.value ?? [];

  return messages.map((m) => ({
    id: m.id,
    from: m.from?.emailAddress?.name ?? "Unknown",
    fromEmail: m.from?.emailAddress?.address ?? "",
    subject: m.subject || "(no subject)",
    snippet: m.bodyPreview ?? "",
    date: formatDate(m.receivedDateTime),
    timestamp: new Date(m.receivedDateTime).getTime() || 0,
    unread: !m.isRead,
    hasAttachment: m.hasAttachments,
    source: "outlook" as const,
  }));
}

export interface OutlookMessageDetail {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  bodyHtml: string;
  bodyText: string;
}

export async function fetchOutlookMessage(
  accessToken: string,
  messageId: string
): Promise<OutlookMessageDetail> {
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}?$select=id,subject,body,from,toRecipients,receivedDateTime`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook message fetch failed (${res.status}): ${err}`);
  }

  const m = await res.json();
  const isHtml = m.body?.contentType === "html";

  return {
    id: m.id,
    from: m.from?.emailAddress?.name ?? "Unknown",
    fromEmail: m.from?.emailAddress?.address ?? "",
    to:
      (m.toRecipients ?? [])
        .map((r: { emailAddress?: { address?: string } }) => r.emailAddress?.address)
        .filter(Boolean)
        .join(", ") ?? "",
    subject: m.subject || "(no subject)",
    date: m.receivedDateTime ?? "",
    bodyHtml: isHtml ? m.body?.content ?? "" : "",
    bodyText: isHtml ? "" : m.body?.content ?? "",
  };
}

export async function getOutlookUnreadCount(
  accessToken: string
): Promise<number> {
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/inbox?$select=unreadItemCount`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) return 0;
  const data = await res.json();
  return data.unreadItemCount ?? 0;
}

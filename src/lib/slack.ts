// Slack API helper — fetches messages using an independently stored OAuth token

export interface SlackMessage {
  id: string;
  channel: string;
  channelName: string;
  from: string;
  text: string;
  date: string;
  isDM: boolean;
  isMention: boolean;
}

interface SlackChannel {
  id: string;
  name: string;
  is_im: boolean;
  is_mpim: boolean;
}

interface SlackUser {
  id: string;
  real_name: string;
  name: string;
}

function formatTs(ts: string): string {
  const date = new Date(parseFloat(ts) * 1000);
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

async function slackGet(
  endpoint: string,
  token: string,
  params?: Record<string, string>
) {
  const url = new URL(`https://slack.com/api/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchSlackMessages(
  accessToken: string,
  maxResults = 30
): Promise<SlackMessage[]> {
  // Get conversations list (channels, DMs)
  const convData = await slackGet("conversations.list", accessToken, {
    types: "public_channel,private_channel,im,mpim",
    limit: "20",
    exclude_archived: "true",
  });

  if (!convData.ok) {
    throw new Error(`Slack conversations.list failed: ${convData.error}`);
  }

  const channels: SlackChannel[] = convData.channels ?? [];

  // Build a user cache for resolving DM names
  const userCache: Record<string, string> = {};

  // Fetch recent messages from each channel (up to 3 per channel)
  const allMessages: SlackMessage[] = [];

  const fetchPromises = channels.slice(0, 10).map(async (ch) => {
    const histData = await slackGet("conversations.history", accessToken, {
      channel: ch.id,
      limit: "3",
    });

    if (!histData.ok) return;

    const msgs: { ts: string; text: string; user?: string }[] =
      histData.messages ?? [];

    for (const msg of msgs) {
      let fromName = "Unknown";
      if (msg.user) {
        if (!userCache[msg.user]) {
          const userData = await slackGet("users.info", accessToken, {
            user: msg.user,
          });
          if (userData.ok) {
            userCache[msg.user] =
              userData.user?.real_name || userData.user?.name || msg.user;
          }
        }
        fromName = userCache[msg.user] ?? msg.user;
      }

      allMessages.push({
        id: `${ch.id}-${msg.ts}`,
        channel: ch.id,
        channelName: ch.is_im ? `DM with ${fromName}` : `#${ch.name}`,
        from: fromName,
        text: msg.text ?? "",
        date: formatTs(msg.ts),
        isDM: ch.is_im || ch.is_mpim,
        isMention: (msg.text ?? "").includes("<@"),
      });
    }
  });

  await Promise.all(fetchPromises);

  // Sort by timestamp descending and limit
  return allMessages
    .sort((a, b) => {
      const tsA = a.id.split("-").pop() ?? "0";
      const tsB = b.id.split("-").pop() ?? "0";
      return parseFloat(tsB) - parseFloat(tsA);
    })
    .slice(0, maxResults);
}

export async function getSlackProfile(
  accessToken: string
): Promise<{ name: string; team: string } | null> {
  const res = await slackGet("auth.test", accessToken);
  if (!res.ok) return null;
  return { name: res.user, team: res.team };
}

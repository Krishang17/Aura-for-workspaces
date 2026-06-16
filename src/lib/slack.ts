// Slack API helper — fetches real, human-readable messages using a user token

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
  name?: string;
  is_im?: boolean;
  is_mpim?: boolean;
  is_member?: boolean;
  is_archived?: boolean;
  user?: string; // for IMs: the other user's id
}

interface SlackRawMessage {
  ts: string;
  text?: string;
  user?: string;
  subtype?: string;
  bot_id?: string;
}

function formatTs(ts: string): string {
  const date = new Date(parseFloat(ts) * 1000);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
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
  maxResults = 25
): Promise<SlackMessage[]> {
  // Who am I? (used for resolving "you" and detecting mentions of me)
  const auth = await slackGet("auth.test", accessToken);
  const myId: string = auth?.user_id ?? "";

  const convData = await slackGet("conversations.list", accessToken, {
    types: "public_channel,private_channel,im,mpim",
    limit: "100",
    exclude_archived: "true",
  });
  if (!convData.ok) {
    throw new Error(`Slack conversations.list failed: ${convData.error}`);
  }

  const channels: SlackChannel[] = (convData.channels ?? []).filter(
    (c: SlackChannel) =>
      !c.is_archived && (c.is_im || c.is_mpim || c.is_member)
  );

  // User-name cache (resolves authors AND <@id> mentions in text)
  const userCache: Record<string, string> = {};
  async function resolveUser(id: string): Promise<string> {
    if (!id) return "Unknown";
    if (id === myId) return "You";
    if (userCache[id]) return userCache[id];
    const u = await slackGet("users.info", accessToken, { user: id });
    const name =
      u?.user?.profile?.display_name ||
      u?.user?.real_name ||
      u?.user?.name ||
      "Someone";
    userCache[id] = name;
    return name;
  }

  // Clean Slack markup: <@U123> -> @Name, <#C1|chan> -> #chan, <url|label> -> label
  async function cleanText(text: string): Promise<string> {
    let out = text;
    const mentionIds = [...text.matchAll(/<@([A-Z0-9]+)>/g)].map((m) => m[1]);
    for (const id of mentionIds) {
      const name = await resolveUser(id);
      out = out.replace(new RegExp(`<@${id}>`, "g"), `@${name}`);
    }
    out = out.replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1");
    out = out.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2");
    out = out.replace(/<(https?:\/\/[^>]+)>/g, "$1");
    out = out.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return out.trim();
  }

  const collected: { msg: SlackMessage; ts: number }[] = [];

  // Scan the most relevant conversations
  await Promise.all(
    channels.slice(0, 20).map(async (ch) => {
      const hist = await slackGet("conversations.history", accessToken, {
        channel: ch.id,
        limit: "8",
      });
      if (!hist.ok) return;

      const otherName =
        ch.is_im && ch.user ? await resolveUser(ch.user) : "";
      const channelName = ch.is_im
        ? `DM with ${otherName}`
        : ch.is_mpim
          ? "Group DM"
          : `#${ch.name ?? "channel"}`;

      for (const m of (hist.messages ?? []) as SlackRawMessage[]) {
        // Skip system events (joins/leaves/etc.) and bot/Slackbot noise
        if (m.subtype) continue;
        if (m.bot_id) continue;
        if (m.user === "USLACKBOT") continue;
        if (!m.text || !m.text.trim()) continue;

        const fromName = m.user ? await resolveUser(m.user) : "Unknown";
        const text = await cleanText(m.text);
        if (!text) continue;

        collected.push({
          ts: parseFloat(m.ts),
          msg: {
            id: `${ch.id}-${m.ts}`,
            channel: ch.id,
            channelName,
            from: fromName,
            text,
            date: formatTs(m.ts),
            isDM: Boolean(ch.is_im || ch.is_mpim),
            isMention: myId ? m.text.includes(`<@${myId}>`) : false,
          },
        });
      }
    })
  );

  return collected
    .sort((a, b) => b.ts - a.ts)
    .slice(0, maxResults)
    .map((c) => c.msg);
}

export async function getSlackProfile(
  accessToken: string
): Promise<{ name: string; team: string } | null> {
  const res = await slackGet("auth.test", accessToken);
  if (!res.ok) return null;
  return { name: res.user, team: res.team };
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchGmailMessages, getGmailUnreadCount, type GmailMessage } from "@/lib/gmail";
import { fetchOutlookMessages, getOutlookUnreadCount, type OutlookMessage } from "@/lib/outlook";
import { fetchGoogleCalendar, fetchOutlookCalendar, type CalendarEvent } from "@/lib/calendar";
import { getOutlookAccessToken } from "@/lib/secondary-auth";
import { getSlackToken } from "@/lib/slack-oauth";
import { fetchSlackMessages, type SlackMessage } from "@/lib/slack";
import { generateExecutiveSummary } from "@/lib/ai";

export const maxDuration = 30;

const HIGH_PRIORITY = /urgent|asap|important|action required|deadline|due |approve|overdue|immediately/i;
const ACTION = /\?|please|review|approve|confirm|respond|reply|sign|complete|submit|feedback/i;

function overlap(a: CalendarEvent, b: CalendarEvent): boolean {
  if (a.allDay || b.allDay) return false;
  return (
    new Date(a.start).getTime() < new Date(b.end).getTime() &&
    new Date(b.start).getTime() < new Date(a.end).getTime()
  );
}

// Count open gaps >= 60 min between timed events during 9:00–18:00
function countFocusBlocks(events: CalendarEvent[]): number {
  const timed = events
    .filter((e) => !e.allDay)
    .map((e) => ({ start: new Date(e.start), end: new Date(e.end) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const now = new Date();
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0);
  let blocks = 0;

  for (const ev of timed) {
    if (ev.start.getTime() - cursor.getTime() >= 60 * 60 * 1000) blocks++;
    if (ev.end > cursor) cursor = ev.end;
  }
  if (dayEnd.getTime() - cursor.getTime() >= 60 * 60 * 1000) blocks++;
  return blocks;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  // ── Gather all sources in parallel ──
  const emailPromise = (async () => {
    const messages: (GmailMessage | OutlookMessage)[] = [];
    let unread = 0;
    if (session.provider === "google") {
      const [m, u] = await Promise.all([
        fetchGmailMessages(session.accessToken, 15),
        getGmailUnreadCount(session.accessToken),
      ]);
      messages.push(...m);
      unread += u;
    } else if (session.provider === "microsoft") {
      const [m, u] = await Promise.all([
        fetchOutlookMessages(session.accessToken, 15),
        getOutlookUnreadCount(session.accessToken),
      ]);
      messages.push(...m);
      unread += u;
    }
    if (session.provider !== "microsoft") {
      const t = await getOutlookAccessToken();
      if (t) {
        try {
          const [m, u] = await Promise.all([
            fetchOutlookMessages(t, 15),
            getOutlookUnreadCount(t),
          ]);
          messages.push(...m);
          unread += u;
        } catch {}
      }
    }
    messages.sort((a, b) => b.timestamp - a.timestamp);
    return { messages, unread };
  })();

  const calendarPromise = (async () => {
    const events: CalendarEvent[] = [];
    try {
      if (session.provider === "google") {
        events.push(...(await fetchGoogleCalendar(session.accessToken)));
      } else if (session.provider === "microsoft") {
        events.push(...(await fetchOutlookCalendar(session.accessToken)));
      }
      if (session.provider !== "microsoft") {
        const t = await getOutlookAccessToken();
        if (t) events.push(...(await fetchOutlookCalendar(t)));
      }
    } catch {}
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return events;
  })();

  const slackPromise = (async () => {
    const token = await getSlackToken();
    if (!token) return { connected: false, messages: [] as SlackMessage[] };
    try {
      const messages = await fetchSlackMessages(token, 30);
      return { connected: true, messages };
    } catch {
      return { connected: false, messages: [] as SlackMessage[] };
    }
  })();

  const [emailData, events, slackData] = await Promise.all([
    emailPromise,
    calendarPromise,
    slackPromise,
  ]);

  // ── Compute digests ──
  const highPriority = emailData.messages.filter(
    (m) => m.unread && HIGH_PRIORITY.test(`${m.subject} ${m.snippet}`)
  ).length;
  const actionRequired = emailData.messages.filter((m) =>
    ACTION.test(`${m.subject} ${m.snippet}`)
  ).length;

  const conflictIds = new Set<string>();
  const conflictPairs: string[] = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (overlap(events[i], events[j])) {
        conflictIds.add(events[i].id);
        conflictIds.add(events[j].id);
        conflictPairs.push(`"${events[i].title}" overlaps "${events[j].title}"`);
      }
    }
  }
  const focusBlocks = countFocusBlocks(events);

  const slackMessages = slackData.messages;
  const slackChannels = new Set(
    slackMessages.filter((m) => !m.isDM).map((m) => m.channelName)
  ).size;
  const slackMentions = slackMessages.filter((m) => m.isMention).length;
  const slackDms = slackMessages.filter((m) => m.isDM).length;

  // ── AI summary ──
  const { summary, ai } = await generateExecutiveSummary({
    firstName,
    emailCounts: { unread: emailData.unread, highPriority, actionRequired },
    topEmails: emailData.messages
      .slice(0, 6)
      .map((m) => ({ from: m.from, subject: m.subject })),
    calendarCounts: {
      meetings: events.length,
      conflicts: conflictPairs.length,
      focusBlocks,
    },
    events: events
      .slice(0, 8)
      .map((e) => ({ title: e.title, time: e.allDay ? "All day" : e.startLabel })),
    conflictPairs,
    slack: {
      connected: slackData.connected,
      channels: slackChannels,
      mentions: slackMentions,
      dms: slackDms,
    },
    topSlack: slackMessages
      .slice(0, 6)
      .map((m) => ({ from: m.from, channel: m.channelName, text: m.text.slice(0, 120) })),
  });

  return NextResponse.json({
    summary,
    ai,
    generatedAt: new Date().toISOString(),
    email: {
      unread: emailData.unread,
      highPriority,
      actionRequired,
    },
    calendar: {
      meetings: events.length,
      conflicts: conflictPairs.length,
      focusBlocks,
    },
    slack: {
      connected: slackData.connected,
      channels: slackChannels,
      mentions: slackMentions,
      dms: slackDms,
    },
  });
}

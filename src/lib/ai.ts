// OpenAI helper for generating the executive briefing summary.

export interface BriefingInput {
  firstName: string;
  emailCounts: { unread: number; highPriority: number; actionRequired: number };
  topEmails: { from: string; subject: string }[];
  calendarCounts: { meetings: number; conflicts: number; focusBlocks: number };
  events: { title: string; time: string }[];
  conflictPairs: string[];
  slack: { connected: boolean; channels: number; mentions: number; dms: number };
  topSlack: { from: string; channel: string; text: string }[];
}

// Deterministic fallback if no API key or the API call fails — still useful.
function fallbackSummary(d: BriefingInput): string {
  const parts: string[] = [];

  if (d.calendarCounts.meetings > 0) {
    let s = `You have ${d.calendarCounts.meetings} meeting${d.calendarCounts.meetings === 1 ? "" : "s"} today`;
    if (d.calendarCounts.conflicts > 0) {
      s += `, including ${d.calendarCounts.conflicts} scheduling conflict${d.calendarCounts.conflicts === 1 ? "" : "s"} that need${d.calendarCounts.conflicts === 1 ? "s" : ""} attention`;
    }
    if (d.calendarCounts.focusBlocks > 0) {
      s += `. There ${d.calendarCounts.focusBlocks === 1 ? "is" : "are"} ${d.calendarCounts.focusBlocks} open focus block${d.calendarCounts.focusBlocks === 1 ? "" : "s"} to protect`;
    }
    parts.push(s + ".");
  } else {
    parts.push("Your calendar is clear today — a good opportunity for deep work.");
  }

  if (d.emailCounts.unread > 0) {
    let s = `You have ${d.emailCounts.unread} unread email${d.emailCounts.unread === 1 ? "" : "s"}`;
    if (d.topEmails.length > 0) {
      s += `. The most recent is from ${d.topEmails[0].from} about "${d.topEmails[0].subject}"`;
    }
    parts.push(s + ".");
  } else {
    parts.push("Your inbox is all caught up.");
  }

  if (d.slack.connected) {
    parts.push(
      `On Slack, you have ${d.slack.mentions} mention${d.slack.mentions === 1 ? "" : "s"} and ${d.slack.dms} direct message${d.slack.dms === 1 ? "" : "s"} across ${d.slack.channels} channel${d.slack.channels === 1 ? "" : "s"}.`
    );
  }

  return parts.join(" ");
}

export async function generateExecutiveSummary(
  d: BriefingInput
): Promise<{ summary: string; ai: boolean }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { summary: fallbackSummary(d), ai: false };

  const context = {
    calendar: {
      meetingsToday: d.calendarCounts.meetings,
      conflicts: d.conflictPairs,
      focusBlocks: d.calendarCounts.focusBlocks,
      events: d.events,
    },
    email: {
      unread: d.emailCounts.unread,
      highPriority: d.emailCounts.highPriority,
      actionRequired: d.emailCounts.actionRequired,
      recent: d.topEmails,
    },
    slack: d.slack.connected
      ? { mentions: d.slack.mentions, dms: d.slack.dms, recent: d.topSlack }
      : "not connected",
  };

  const prompt = `You are Aura, an executive assistant. Write a concise morning briefing for ${d.firstName} based on the JSON data below. Use exactly 3 short paragraphs: (1) calendar and any conflicts/focus time, (2) email highlights and what needs action, (3) Slack highlights (skip if not connected). Be specific, reference real senders/subjects/events, and keep a calm, professional "chief of staff" tone. Do not invent anything not in the data.\n\nDATA:\n${JSON.stringify(context)}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a precise, helpful executive assistant. Never fabricate details.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.5,
      }),
    });

    if (!res.ok) return { summary: fallbackSummary(d), ai: false };
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return { summary: fallbackSummary(d), ai: false };
    return { summary: content, ai: true };
  } catch {
    return { summary: fallbackSummary(d), ai: false };
  }
}

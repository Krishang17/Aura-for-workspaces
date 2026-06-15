// Calendar helpers — fetch real events from Google Calendar and Outlook Calendar

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  startLabel: string; // human-friendly time
  endLabel: string;
  allDay: boolean;
  location?: string;
  attendees: number;
  source: "google" | "outlook";
}

function formatTime(iso: string, allDay: boolean): string {
  if (allDay) return "All day";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Google Calendar ──

interface GoogleEvent {
  id: string;
  summary?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: { email: string }[];
}

export async function fetchGoogleCalendar(
  accessToken: string
): Promise<CalendarEvent[]> {
  // Today from midnight to end of day (local-ish; uses server time)
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const timeMax = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  ).toISOString();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "20",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar fetch failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const events: GoogleEvent[] = data.items ?? [];

  return events.map((e) => {
    const allDay = !e.start.dateTime;
    const start = e.start.dateTime ?? e.start.date ?? "";
    const end = e.end.dateTime ?? e.end.date ?? "";
    return {
      id: e.id,
      title: e.summary ?? "(no title)",
      start,
      end,
      startLabel: formatTime(start, allDay),
      endLabel: formatTime(end, allDay),
      allDay,
      location: e.location,
      attendees: e.attendees?.length ?? 0,
      source: "google" as const,
    };
  });
}

// ── Outlook Calendar (Microsoft Graph) ──

interface GraphEvent {
  id: string;
  subject?: string;
  location?: { displayName?: string };
  isAllDay: boolean;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: unknown[];
}

export async function fetchOutlookCalendar(
  accessToken: string
): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  ).toISOString();

  const params = new URLSearchParams({
    startDateTime: startOfDay,
    endDateTime: endOfDay,
    $orderby: "start/dateTime",
    $top: "20",
  });

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarView?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'outlook.timezone="UTC"',
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook Calendar fetch failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const events: GraphEvent[] = data.value ?? [];

  return events.map((e) => {
    // Graph returns dateTime without timezone suffix; treat as UTC
    const start = e.start.dateTime.endsWith("Z")
      ? e.start.dateTime
      : `${e.start.dateTime}Z`;
    const end = e.end.dateTime.endsWith("Z")
      ? e.end.dateTime
      : `${e.end.dateTime}Z`;
    return {
      id: e.id,
      title: e.subject ?? "(no title)",
      start,
      end,
      startLabel: formatTime(start, e.isAllDay),
      endLabel: formatTime(end, e.isAllDay),
      allDay: e.isAllDay,
      location: e.location?.displayName,
      attendees: e.attendees?.length ?? 0,
      source: "outlook" as const,
    };
  });
}

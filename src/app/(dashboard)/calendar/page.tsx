"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatClockTime } from "@/lib/format-time";
import {
  CalendarDays,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Loader2,
  CalendarX,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
  allDay: boolean;
  location?: string;
  attendees: number;
  source: "google" | "outlook";
}

// Two events overlap if one starts before the other ends
function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  if (a.allDay || b.allDay) return false;
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalendar() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/calendar");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load calendar");
        }
        const data = await res.json();
        setEvents(data.events ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    }
    if (session) loadCalendar();
  }, [session]);

  // Detect which events have a conflict
  const conflictIds = new Set<string>();
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (eventsOverlap(events[i], events[j])) {
        conflictIds.add(events[i].id);
        conflictIds.add(events[j].id);
      }
    }
  }
  const hasConflicts = conflictIds.size > 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Loading your calendar...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Could not load calendar
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflict alert */}
      {!loading && !error && hasConflicts && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Scheduling Conflict Detected
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">
                You have overlapping events today. Review the highlighted items
                below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <CalendarX className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">No events scheduled for today</p>
          <p className="text-xs mt-1">Enjoy your clear day!</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => {
              const isConflict = conflictIds.has(event.id);
              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-4 rounded-lg border-l-4 p-4 ${
                    isConflict
                      ? "border-l-red-500 bg-red-50 ring-1 ring-red-200 dark:bg-red-950/30 dark:ring-red-900"
                      : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{event.title}</span>
                      {isConflict && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Conflict
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.allDay
                          ? "All day"
                          : `${formatClockTime(event.start)} – ${formatClockTime(event.end)}`}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                      {event.attendees > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendees} attendee
                          {event.attendees !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

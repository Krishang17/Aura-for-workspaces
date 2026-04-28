"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  AlertTriangle,
  Sparkles,
  Clock,
  Brain,
  ArrowRight,
} from "lucide-react";

const DEMO_EVENTS = [
  {
    id: "1",
    title: "Morning Focus Block",
    time: "8:00 AM – 9:30 AM",
    type: "focus" as const,
    source: "aura",
    conflict: false,
  },
  {
    id: "2",
    title: "Product Roadmap Review",
    time: "10:00 AM – 11:00 AM",
    type: "meeting" as const,
    source: "google",
    conflict: false,
  },
  {
    id: "3",
    title: "1:1 with Direct Report",
    time: "11:30 AM – 12:00 PM",
    type: "meeting" as const,
    source: "outlook",
    conflict: false,
  },
  {
    id: "4",
    title: "Team Standup",
    time: "2:00 PM – 2:30 PM",
    type: "meeting" as const,
    source: "google",
    conflict: true,
  },
  {
    id: "5",
    title: "Client Call — Acme Corp",
    time: "2:00 PM – 3:00 PM",
    type: "meeting" as const,
    source: "outlook",
    conflict: true,
  },
  {
    id: "6",
    title: "Deep Work Block",
    time: "3:30 PM – 5:00 PM",
    type: "focus" as const,
    source: "aura",
    conflict: false,
  },
];

const typeStyles = {
  meeting: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
  focus: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
};

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Calendar</h1>
          <p className="text-muted-foreground">
            AI-optimized schedule with conflict resolution and focus blocks
          </p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Auto-Schedule
        </Button>
      </div>

      {/* Conflict alert */}
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
              &quot;Team Standup&quot; and &quot;Client Call — Acme Corp&quot; overlap at 2:00 PM.
              Aura suggests moving the standup to 2:30 PM.
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300">
            <Sparkles className="h-3.5 w-3.5" />
            Resolve
          </Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5" />
            Today&apos;s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_EVENTS.map((event) => (
            <div
              key={event.id}
              className={`flex items-center gap-4 rounded-lg border-l-4 p-4 ${typeStyles[event.type]} ${event.conflict ? "ring-2 ring-red-300 dark:ring-red-800" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{event.title}</span>
                  {event.type === "focus" && (
                    <Badge variant="success" className="gap-1">
                      <Brain className="h-3 w-3" />
                      Focus
                    </Badge>
                  )}
                  {event.conflict && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Conflict
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{event.time}</span>
                  <span className="text-muted-foreground/50">via {event.source}</span>
                </div>
              </div>
              {event.conflict && (
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Move
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Focus suggestion */}
      <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
            <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              Focus Time Suggestion
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Aura detected a 1.5-hour gap from 3:30 PM – 5:00 PM. A &quot;Deep Work&quot;
              block has been suggested to protect your focus time.
            </p>
          </div>
          <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300">
            Accept
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

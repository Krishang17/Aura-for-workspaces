"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";

// Demo data — will be replaced with live Firestore data in Phase 1
const DEMO_BRIEFING = {
  summary:
    "You have 3 high-priority emails requiring responses, a scheduling conflict at 2 PM, and 2 action items carried over from yesterday. Your afternoon is clear for deep work after the conflict is resolved.",
  stats: {
    unreadEmails: 12,
    todayMeetings: 4,
    actionItems: 5,
    conflicts: 1,
  },
  urgentItems: [
    {
      id: "1",
      type: "email" as const,
      title: "Q3 Budget Review — needs approval",
      from: "Sarah Chen",
      urgency: "high" as const,
      time: "9:15 AM",
    },
    {
      id: "2",
      type: "email" as const,
      title: "Partnership proposal from Acme Corp",
      from: "James Wilson",
      urgency: "high" as const,
      time: "8:42 AM",
    },
    {
      id: "3",
      type: "event" as const,
      title: "Conflict: Team Standup & Client Call overlap at 2:00 PM",
      from: "Calendar",
      urgency: "critical" as const,
      time: "2:00 PM",
    },
  ],
  actionItems: [
    { text: "Reply to Sarah about budget approval", done: false },
    { text: "Prepare slides for Thursday board meeting", done: false },
    { text: "Review hiring pipeline spreadsheet", done: true },
    { text: "Send follow-up to vendor negotiation", done: false },
    { text: "Sign off on marketing campaign brief", done: false },
  ],
};

const urgencyColor = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
} as const;

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!session) redirect("/login");

  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your executive briefing for today.
        </p>
      </div>

      {/* AI Summary Card */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 dark:border-indigo-900 dark:from-indigo-950/40 dark:to-violet-950/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <TrendingUp className="h-5 w-5" />
            Morning Briefing
          </CardTitle>
          <CardDescription className="text-indigo-700 dark:text-indigo-300">
            AI-generated summary of your day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
            {DEMO_BRIEFING.summary}
          </p>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Unread Emails",
            value: DEMO_BRIEFING.stats.unreadEmails,
            icon: Mail,
            color: "text-blue-600",
          },
          {
            label: "Today's Meetings",
            value: DEMO_BRIEFING.stats.todayMeetings,
            icon: CalendarDays,
            color: "text-green-600",
          },
          {
            label: "Action Items",
            value: DEMO_BRIEFING.stats.actionItems,
            icon: CheckCircle2,
            color: "text-amber-600",
          },
          {
            label: "Conflicts",
            value: DEMO_BRIEFING.stats.conflicts,
            icon: AlertTriangle,
            color: "text-red-600",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Needs Your Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_BRIEFING.urgentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <div className="mt-0.5">
                  {item.type === "email" ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.from}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={urgencyColor[item.urgency]}>
                    {item.urgency}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_BRIEFING.actionItems.map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  defaultChecked={item.done}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span
                  className={`text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}
                >
                  {item.text}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

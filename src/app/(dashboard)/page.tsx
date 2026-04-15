"use client";

import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import type { GmailMessage } from "@/lib/gmail";

const urgencyColor = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
} as const;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emailsLoading, setEmailsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/gmail");
        if (res.ok) {
          const data = await res.json();
          setEmails(data.messages ?? []);
          setUnreadCount(data.unreadCount ?? 0);
        }
      } finally {
        setEmailsLoading(false);
      }
    }
    if (session) loadData();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!session) redirect("/login");

  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  // Build urgent items from real emails (unread)
  const urgentEmails = emails
    .filter((e) => e.unread)
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      type: "email" as const,
      title: e.subject,
      from: e.from,
      urgency: "high" as const,
      time: e.date,
    }));

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {firstName}
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
          {emailsLoading ? (
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your inbox...
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
              You have {unreadCount} unread email{unreadCount !== 1 ? "s" : ""} in your inbox.
              {urgentEmails.length > 0
                ? ` ${urgentEmails.length} need${urgentEmails.length === 1 ? "s" : ""} your attention — the most recent is from ${urgentEmails[0].from} about "${urgentEmails[0].title}".`
                : " You're all caught up — no urgent items right now."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Unread Emails",
            value: emailsLoading ? "..." : unreadCount,
            icon: Mail,
            color: "text-blue-600",
          },
          {
            label: "Today's Meetings",
            value: "—",
            icon: CalendarDays,
            color: "text-green-600",
          },
          {
            label: "Total Fetched",
            value: emailsLoading ? "..." : emails.length,
            icon: CheckCircle2,
            color: "text-amber-600",
          },
          {
            label: "Provider",
            value: session.provider === "google" ? "Gmail" : session.provider === "microsoft" ? "Outlook" : session.provider ?? "—",
            icon: AlertTriangle,
            color: "text-indigo-600",
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

      {/* Urgent emails from real inbox */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Needs Your Attention</CardTitle>
        </CardHeader>
        <CardContent>
          {emailsLoading ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : urgentEmails.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No unread emails — you&apos;re all caught up!
            </p>
          ) : (
            <div className="space-y-3">
              {urgentEmails.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <div className="mt-0.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.from}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={urgencyColor[item.urgency]}>new</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

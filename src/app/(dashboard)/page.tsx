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
  MessageSquare,
  TrendingUp,
  Clock,
  Loader2,
  Plug,
} from "lucide-react";

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  unread: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emailProvider, setEmailProvider] = useState("");
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackTeam, setSlackTeam] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/emails");
        if (res.ok) {
          const data = await res.json();
          setEmails(data.messages ?? []);
          setUnreadCount(data.unreadCount ?? 0);
          setEmailProvider(data.provider ?? "");
        }
      } finally {
        setEmailsLoading(false);
      }

      // Check Slack status
      try {
        const res = await fetch("/api/slack/status");
        const data = await res.json();
        setSlackConnected(data.connected);
        if (data.team) setSlackTeam(data.team);
      } catch {
        // Slack not connected — that's fine
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

  const unreadEmails = emails.filter((e) => e.unread).slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const providerLabel =
    emailProvider === "gmail"
      ? "Gmail"
      : emailProvider === "outlook"
        ? "Outlook"
        : session.provider === "google"
          ? "Gmail"
          : session.provider === "microsoft"
            ? "Outlook"
            : "Email";

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
              You have {unreadCount} unread email
              {unreadCount !== 1 ? "s" : ""} in {providerLabel}.
              {unreadEmails.length > 0
                ? ` ${unreadEmails.length} need${unreadEmails.length === 1 ? "s" : ""} your attention \u2014 the most recent is from ${unreadEmails[0].from} about "${unreadEmails[0].subject}".`
                : " You're all caught up \u2014 no urgent items right now."}
              {slackConnected
                ? ` Slack (${slackTeam}) is connected and being monitored.`
                : ""}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-muted p-2.5 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {emailsLoading ? "..." : unreadCount}
              </p>
              <p className="text-xs text-muted-foreground">Unread Emails</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-muted p-2.5 text-green-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">\u2014</p>
              <p className="text-xs text-muted-foreground">Today&apos;s Meetings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-muted p-2.5 text-purple-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {slackConnected ? "Connected" : "\u2014"}
              </p>
              <p className="text-xs text-muted-foreground">Slack</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-muted p-2.5 text-indigo-600">
              <Plug className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{providerLabel}</p>
              <p className="text-xs text-muted-foreground">Email Provider</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent emails */}
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
          ) : unreadEmails.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No unread emails \u2014 you&apos;re all caught up!
            </p>
          ) : (
            <div className="space-y-3">
              {unreadEmails.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <div className="mt-0.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.from}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="destructive">new</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.date}
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

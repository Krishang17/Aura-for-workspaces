"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Sparkles,
  Paperclip,
  Clock,
  Loader2,
  AlertCircle,
  Inbox,
  MessageSquare,
} from "lucide-react";

interface EmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  hasAttachment: boolean;
}

interface SlackMsg {
  id: string;
  channelName: string;
  from: string;
  text: string;
  date: string;
  isDM: boolean;
  isMention: boolean;
}

type Filter = "all" | "unread";
type Tab = "email" | "slack";

export default function InboxPage() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [slackMessages, setSlackMessages] = useState<SlackMsg[]>([]);
  const [emailProvider, setEmailProvider] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [slackLoading, setSlackLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slackError, setSlackError] = useState<string | null>(null);
  const [slackConnected, setSlackConnected] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<Tab>("email");

  useEffect(() => {
    async function loadEmails() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/emails");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load emails");
        }
        const data = await res.json();
        setEmails(data.messages ?? []);
        setEmailProvider(data.provider ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load emails");
      } finally {
        setLoading(false);
      }
    }

    async function loadSlack() {
      try {
        setSlackLoading(true);
        const statusRes = await fetch("/api/slack/status");
        const statusData = await statusRes.json();
        setSlackConnected(statusData.connected);

        if (!statusData.connected) {
          setSlackLoading(false);
          return;
        }

        const res = await fetch("/api/slack/messages");
        if (res.ok) {
          const data = await res.json();
          setSlackMessages(data.messages ?? []);
        }
      } catch {
        setSlackError("Failed to load Slack messages");
      } finally {
        setSlackLoading(false);
      }
    }

    if (session) {
      loadEmails();
      loadSlack();
    }
  }, [session]);

  const filtered =
    filter === "unread" ? emails.filter((e) => e.unread) : emails;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const providerLabel =
    emailProvider === "gmail"
      ? "Gmail"
      : emailProvider === "outlook"
        ? "Outlook"
        : "Email";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inbox Intelligence
          </h1>
          <p className="text-muted-foreground">
            Your messages from {providerLabel}
            {slackConnected ? " and Slack" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Tab switcher */}
          <Button
            variant={tab === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("email")}
            className="gap-1.5"
          >
            <Mail className="h-3.5 w-3.5" />
            {providerLabel}
          </Button>
          <Button
            variant={tab === "slack" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("slack")}
            className="gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Slack
          </Button>
        </div>
      </div>

      {/* ─── Email Tab ─── */}
      {tab === "email" && (
        <>
          {/* Filter bar */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm">Loading your emails...</p>
            </div>
          )}

          {error && !loading && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
              <CardContent className="flex items-center gap-4 p-6">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">
                    Could not load emails
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">
                {filter === "unread"
                  ? "No unread emails \u2014 you're all caught up!"
                  : "No emails found"}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((email) => (
                <Card
                  key={email.id}
                  className={`transition-colors hover:bg-muted/30 cursor-pointer ${
                    email.unread ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(email.from)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              !email.unread ? "text-muted-foreground" : ""
                            }`}
                          >
                            {email.from}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {email.date}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            email.unread
                              ? "font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {email.subject}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {email.snippet}
                        </p>
                        {email.hasAttachment && (
                          <div className="mt-2 flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                            <Paperclip className="h-3 w-3" />
                            <span>Has attachment</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {email.unread && <Badge variant="default">New</Badge>}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs text-primary"
                        >
                          <Sparkles className="h-3 w-3" />
                          AI Draft
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Slack Tab ─── */}
      {tab === "slack" && (
        <>
          {!slackConnected && !slackLoading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground/40" />
                <h3 className="text-base font-semibold mb-1">
                  Slack not connected
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect Slack from the Integrations page to see your messages
                  here.
                </p>
                <Button
                  onClick={() => (window.location.href = "/integrations")}
                >
                  Go to Integrations
                </Button>
              </CardContent>
            </Card>
          )}

          {slackLoading && slackConnected && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm">Loading Slack messages...</p>
            </div>
          )}

          {slackError && !slackLoading && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
              <CardContent className="flex items-center gap-4 p-6">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">
                    Could not load Slack messages
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {slackError}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {slackConnected &&
            !slackLoading &&
            !slackError &&
            slackMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm">No recent Slack messages</p>
              </div>
            )}

          {slackConnected && !slackLoading && slackMessages.length > 0 && (
            <div className="space-y-3">
              {slackMessages.map((msg) => (
                <Card key={msg.id} className="transition-colors hover:bg-muted/30 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {getInitials(msg.from)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {msg.from}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            in {msg.channelName}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {msg.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {msg.text}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        {msg.isDM && (
                          <Badge variant="secondary">DM</Badge>
                        )}
                        {msg.isMention && (
                          <Badge variant="warning">Mention</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

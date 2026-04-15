"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
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
} from "lucide-react";
import type { GmailMessage } from "@/lib/gmail";

type Filter = "all" | "unread";

export default function InboxPage() {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    async function loadEmails() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/gmail");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load emails");
        }
        const data = await res.json();
        setEmails(data.messages ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load emails");
      } finally {
        setLoading(false);
      }
    }

    if (session) loadEmails();
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inbox Intelligence
          </h1>
          <p className="text-muted-foreground">
            {session?.provider === "google"
              ? "Your real Gmail inbox"
              : "Connect Google to see your emails"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Loading your emails...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Could not load emails
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Inbox className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">
            {filter === "unread"
              ? "No unread emails — you're all caught up!"
              : "No emails found"}
          </p>
        </div>
      )}

      {/* Email list */}
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
                  {/* Sender avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(email.from)}
                  </div>

                  {/* Content */}
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

                  {/* Status & actions */}
                  <div className="flex flex-col items-end gap-2">
                    {email.unread && (
                      <Badge variant="default">New</Badge>
                    )}
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
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  RefreshCw,
  Calendar,
  Mail,
  MessageSquare,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface Briefing {
  summary: string;
  ai: boolean;
  generatedAt: string;
  email: { unread: number; highPriority: number; actionRequired: number };
  calendar: { meetings: number; conflicts: number; focusBlocks: number };
  slack: { connected: boolean; channels: number; mentions: number; dms: number };
}

export default function BriefingPage() {
  const { data: session } = useSession();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/briefing");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate briefing");
      }
      setBriefing(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate briefing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const generatedLabel = briefing
    ? new Date(briefing.generatedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Morning Briefing</h1>
          <p className="text-muted-foreground">
            AI-powered summary of your day, from your real accounts
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 dark:border-indigo-900 dark:from-indigo-950/40 dark:to-violet-950/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <Newspaper className="h-5 w-5" />
            Executive Summary
          </CardTitle>
          <CardDescription className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            {loading
              ? "Analyzing your day..."
              : briefing
                ? `Generated at ${generatedLabel}`
                : ""}
            {briefing?.ai && (
              <Badge variant="default" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
          {loading && (
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading your inbox, calendar, and Slack...
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {briefing &&
            !loading &&
            briefing.summary
              .split("\n")
              .filter((p) => p.trim())
              .map((para, i) => <p key={i}>{para}</p>)}
        </CardContent>
      </Card>

      {/* Source breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-blue-500" />
              Email Digest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Unread" value={briefing?.email.unread} loading={loading} variant="secondary" />
            <Row label="High Priority" value={briefing?.email.highPriority} loading={loading} variant="destructive" />
            <Row label="Action Required" value={briefing?.email.actionRequired} loading={loading} variant="warning" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-green-500" />
              Calendar Digest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Meetings Today" value={briefing?.calendar.meetings} loading={loading} variant="secondary" />
            <Row label="Conflicts" value={briefing?.calendar.conflicts} loading={loading} variant="destructive" />
            <Row label="Focus Blocks" value={briefing?.calendar.focusBlocks} loading={loading} variant="success" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              Slack Digest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {briefing && !briefing.slack.connected && !loading ? (
              <p className="text-xs text-muted-foreground">
                Not connected. Connect Slack from Integrations.
              </p>
            ) : (
              <>
                <Row label="Active Channels" value={briefing?.slack.channels} loading={loading} variant="secondary" />
                <Row label="Mentions" value={briefing?.slack.mentions} loading={loading} variant="warning" />
                <Row label="DMs" value={briefing?.slack.dms} loading={loading} variant="secondary" />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  loading,
  variant,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  variant: "secondary" | "destructive" | "warning" | "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : (
        <Badge variant={variant}>{value ?? 0}</Badge>
      )}
    </div>
  );
}

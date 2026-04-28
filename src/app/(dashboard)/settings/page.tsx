"use client";

import { useState } from "react";
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
  Shield,
  Bell,
  Eye,
  Moon,
  Mail,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [quietMode, setQuietMode] = useState(false);
  const [emailAccess, setEmailAccess] = useState(true);
  const [calendarAccess, setCalendarAccess] = useState(true);
  const [slackAccess, setSlackAccess] = useState(true);
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your privacy, notifications, and preferences
        </p>
      </div>

      {/* Quiet Mode */}
      <Card className={quietMode ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30" : ""}>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900">
            <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">Quiet Mode</h3>
            <p className="text-sm text-muted-foreground">
              Silence all non-urgent AI notifications. Only critical alerts will get through.
            </p>
          </div>
          <Toggle enabled={quietMode} onToggle={() => setQuietMode(!quietMode)} />
        </CardContent>
      </Card>

      {/* Privacy Hub */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            Privacy & Data Access
          </CardTitle>
          <CardDescription>
            Control what data Aura is allowed to access and analyze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Email Access</p>
                <p className="text-xs text-muted-foreground">Read and analyze email content</p>
              </div>
            </div>
            <Toggle enabled={emailAccess} onToggle={() => setEmailAccess(!emailAccess)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Calendar Access</p>
                <p className="text-xs text-muted-foreground">Read calendar events and scheduling</p>
              </div>
            </div>
            <Toggle enabled={calendarAccess} onToggle={() => setCalendarAccess(!calendarAccess)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Slack Access</p>
                <p className="text-xs text-muted-foreground">Read channels, DMs, and mentions</p>
              </div>
            </div>
            <Toggle enabled={slackAccess} onToggle={() => setSlackAccess(!slackAccess)} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose when and how Aura communicates with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Morning Briefing</p>
              <p className="text-xs text-muted-foreground">
                Receive a daily AI summary at 6:00 AM
              </p>
            </div>
            <Toggle enabled={morningBriefing} onToggle={() => setMorningBriefing(!morningBriefing)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Urgent Notifications Only</p>
              <p className="text-xs text-muted-foreground">
                Only notify for high-priority and critical items
              </p>
            </div>
            <Toggle enabled={urgentOnly} onToggle={() => setUrgentOnly(!urgentOnly)} />
          </div>
        </CardContent>
      </Card>

      {/* Data info */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aura follows a local-first philosophy. Your data is processed on-demand
            and cached only in your personal Firestore database. No data is shared
            with third parties beyond the AI summarization provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

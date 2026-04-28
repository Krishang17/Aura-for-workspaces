"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, RefreshCw, Calendar, Mail, MessageSquare } from "lucide-react";

export default function BriefingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Morning Briefing</h1>
          <p className="text-muted-foreground">
            AI-powered summary of your day, updated every morning
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
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
          <CardDescription className="text-indigo-600 dark:text-indigo-400">
            Generated today at 6:00 AM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
          <p>
            Your schedule today includes 4 meetings with one conflict at 2:00 PM
            between your Team Standup and a Client Call. Aura recommends moving
            the standup to 2:30 PM where there is a free slot.
          </p>
          <p>
            You received 12 emails overnight — 3 are high priority. The most
            urgent is Sarah Chen&apos;s Q3 Budget Review which requires your
            approval before EOD. James Wilson from Acme Corp sent a partnership
            proposal worth reviewing during your morning focus block.
          </p>
          <p>
            From Slack, the #engineering channel had active discussion about the
            deployment timeline — no action needed from you, but the
            #leadership channel has a thread requesting your input on Q4
            headcount planning.
          </p>
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
            <div className="flex items-center justify-between">
              <span>Unread</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>High Priority</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Action Required</span>
              <Badge variant="warning">2</Badge>
            </div>
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
            <div className="flex items-center justify-between">
              <span>Meetings Today</span>
              <Badge variant="secondary">4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Conflicts</span>
              <Badge variant="destructive">1</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Focus Blocks</span>
              <Badge variant="success">2</Badge>
            </div>
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
            <div className="flex items-center justify-between">
              <span>Unread Channels</span>
              <Badge variant="secondary">5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Direct Mentions</span>
              <Badge variant="warning">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>DMs</span>
              <Badge variant="secondary">3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  Mail,
  Sparkles,
  Paperclip,
  Clock,
  ArrowUpRight,
} from "lucide-react";

const DEMO_EMAILS = [
  {
    id: "1",
    from: "Sarah Chen",
    email: "sarah.chen@company.com",
    subject: "Q3 Budget Review — Needs Your Approval",
    preview:
      "Hi, please review the attached Q3 budget spreadsheet. We need your sign-off before the board meeting on Thursday...",
    time: "9:15 AM",
    urgency: "high" as const,
    sentiment: "neutral" as const,
    hasAttachment: true,
    attachmentSummary: "PDF: Q3 budget spreadsheet showing 12% increase in spend",
    read: false,
  },
  {
    id: "2",
    from: "James Wilson",
    email: "jwilson@acmecorp.com",
    subject: "Partnership Proposal — Acme Corp x Your Company",
    preview:
      "Following our conversation at the conference, I'd like to formally propose a partnership between our organizations...",
    time: "8:42 AM",
    urgency: "high" as const,
    sentiment: "positive" as const,
    hasAttachment: true,
    attachmentSummary: "DOCX: 8-page partnership proposal with revenue projections",
    read: false,
  },
  {
    id: "3",
    from: "HR Team",
    email: "hr@company.com",
    subject: "Updated PTO Policy — Please Review",
    preview:
      "We've updated the company PTO policy for the upcoming fiscal year. Key changes include...",
    time: "Yesterday",
    urgency: "low" as const,
    sentiment: "neutral" as const,
    hasAttachment: false,
    attachmentSummary: null,
    read: true,
  },
  {
    id: "4",
    from: "David Park",
    email: "d.park@company.com",
    subject: "Re: Client feedback on latest release",
    preview:
      "Just got off the phone with the client — they're unhappy with the latency issues in the new dashboard...",
    time: "Yesterday",
    urgency: "high" as const,
    sentiment: "negative" as const,
    hasAttachment: false,
    attachmentSummary: null,
    read: true,
  },
];

const urgencyColor = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
} as const;

const sentimentColor = {
  positive: "success",
  neutral: "secondary",
  negative: "destructive",
} as const;

export default function InboxPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox Intelligence</h1>
          <p className="text-muted-foreground">
            AI-analyzed emails with urgency and sentiment tagging
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="outline" size="sm">Urgent</Button>
          <Button variant="outline" size="sm">Unread</Button>
        </div>
      </div>

      <div className="space-y-3">
        {DEMO_EMAILS.map((email) => (
          <Card
            key={email.id}
            className={`transition-colors hover:bg-muted/30 cursor-pointer ${!email.read ? "border-l-4 border-l-primary" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Sender avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {email.from.split(" ").map((n) => n[0]).join("")}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${!email.read ? "" : "text-muted-foreground"}`}>
                      {email.from}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {email.time}
                    </span>
                  </div>
                  <p className={`text-sm ${!email.read ? "font-medium" : "text-muted-foreground"}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {email.preview}
                  </p>

                  {/* Attachment intelligence */}
                  {email.hasAttachment && (
                    <div className="mt-2 flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                      <Paperclip className="h-3 w-3" />
                      <span>{email.attachmentSummary}</span>
                    </div>
                  )}
                </div>

                {/* Tags & actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1.5">
                    <Badge variant={urgencyColor[email.urgency]}>
                      {email.urgency}
                    </Badge>
                    <Badge variant={sentimentColor[email.sentiment]}>
                      {email.sentiment}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    AI Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

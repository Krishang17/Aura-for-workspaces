"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  Plug,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function IntegrationsPage() {
  return (
    <Suspense>
      <IntegrationsContent />
    </Suspense>
  );
}

function IntegrationsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackUser, setSlackUser] = useState("");
  const [slackTeam, setSlackTeam] = useState("");
  const [slackLoading, setSlackLoading] = useState(true);

  const slackParam = searchParams.get("slack");

  useEffect(() => {
    async function checkSlack() {
      try {
        const res = await fetch("/api/slack/status");
        const data = await res.json();
        setSlackConnected(data.connected);
        if (data.user) setSlackUser(data.user);
        if (data.team) setSlackTeam(data.team);
      } finally {
        setSlackLoading(false);
      }
    }
    checkSlack();
  }, []);

  const isGoogle = session?.provider === "google";
  const isMicrosoft = session?.provider === "microsoft";

  const integrations = [
    {
      id: "google",
      name: "Google Workspace",
      description:
        "Gmail & Google Calendar \u2014 read emails, events, and contacts",
      connected: isGoogle,
      connectedAs: isGoogle ? session?.user?.email : undefined,
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
    },
    {
      id: "microsoft",
      name: "Microsoft 365",
      description:
        "Outlook Mail & Calendar \u2014 read emails, events, and contacts",
      connected: isMicrosoft,
      connectedAs: isMicrosoft ? session?.user?.email : undefined,
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
      ),
    },
    {
      id: "slack",
      name: "Slack",
      description:
        "Read channels, DMs, and mentions for AI summarization",
      connected: slackConnected,
      connectedAs: slackConnected
        ? `${slackUser} on ${slackTeam}`
        : undefined,
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
          <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
          <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.522-2.521V2.522A2.528 2.528 0 0 1 15.164 0a2.528 2.528 0 0 1 2.522 2.522v6.312z" fill="#2EB67D" />
          <path d="M15.164 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.164 24a2.528 2.528 0 0 1-2.522-2.522v-2.522h2.522zm0-1.27a2.528 2.528 0 0 1-2.522-2.522 2.528 2.528 0 0 1 2.522-2.522h6.314A2.528 2.528 0 0 1 24 15.164a2.528 2.528 0 0 1-2.522 2.522h-6.314z" fill="#ECB22E" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your tools so Aura can synthesize your work into actionable
          intelligence
        </p>
      </div>

      {/* Success/error banners from Slack callback */}
      {slackParam === "connected" && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              Slack connected successfully! Your messages will now appear in the
              Inbox and Briefing.
            </p>
          </CardContent>
        </Card>
      )}
      {slackParam === "error" && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-900 dark:text-red-200">
              Failed to connect Slack. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardContent className="flex items-center gap-6 p-6">
              <div className="shrink-0">{integration.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">
                    {integration.name}
                  </h3>
                  {integration.id === "slack" && slackLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : integration.connected ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Circle className="h-3 w-3" />
                      Not connected
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {integration.description}
                </p>
                {integration.connectedAs && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Connected as {integration.connectedAs}
                  </p>
                )}
              </div>

              {/* Action button */}
              {integration.id === "slack" ? (
                slackConnected ? (
                  <Button variant="outline" className="gap-1">
                    Active
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      (window.location.href = "/api/slack/connect")
                    }
                  >
                    Connect Slack
                  </Button>
                )
              ) : integration.connected ? (
                <Button variant="outline" className="gap-1">
                  Active
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Sign in to connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="h-5 w-5" />
            How Integrations Work
          </CardTitle>
          <CardDescription>
            Aura uses secure OAuth to connect to your accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Email & Calendar</strong> are connected automatically when
            you sign in with Google or Microsoft. Aura requests read-only access
            to your inbox and calendar.
          </p>
          <p>
            <strong>Slack</strong> is connected separately \u2014 click
            &quot;Connect Slack&quot; above to authorize. Your company admin can
            pre-approve the Slack app for all employees.
          </p>
          <p>
            Your credentials are never stored \u2014 only encrypted OAuth
            tokens. You can revoke access at any time from this page or from the
            provider&apos;s security settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

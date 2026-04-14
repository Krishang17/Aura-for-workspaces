"use client";

import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle2, Circle } from "lucide-react";

const integrations = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Gmail & Google Calendar — read emails, events, and contacts",
    connected: false,
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    description: "Outlook Mail & Calendar — read emails, events, and contacts",
    connected: false,
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
      </svg>
    ),
  },
  {
    id: "slack",
    name: "Slack",
    description: "Read channels, DMs, and mentions for AI summarization",
    connected: false,
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.522-2.521V2.522A2.528 2.528 0 0 1 15.164 0a2.528 2.528 0 0 1 2.522 2.522v6.312z" fill="#2EB67D"/>
        <path d="M15.164 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.164 24a2.528 2.528 0 0 1-2.522-2.522v-2.522h2.522zm0-1.27a2.528 2.528 0 0 1-2.522-2.522 2.528 2.528 0 0 1 2.522-2.522h6.314A2.528 2.528 0 0 1 24 15.164a2.528 2.528 0 0 1-2.522 2.522h-6.314z" fill="#ECB22E"/>
      </svg>
    ),
  },
];

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your tools so Aura can synthesize your work into actionable intelligence
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardContent className="flex items-center gap-6 p-6">
              <div className="shrink-0">{integration.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{integration.name}</h3>
                  {integration.connected ? (
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
              </div>
              <Button
                variant={integration.connected ? "outline" : "default"}
                onClick={() => {
                  if (!integration.connected) {
                    signIn(integration.id);
                  }
                }}
              >
                {integration.connected ? "Manage" : "Connect"}
              </Button>
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
            When you connect a service, Aura requests read-only access to your
            emails, calendar events, and messages. Your credentials are never
            stored — only encrypted OAuth tokens.
          </p>
          <p>
            You can revoke access at any time from this page or from the
            provider&apos;s security settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

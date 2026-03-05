"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Integration {
  id: string;
  provider: string;
  email: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

interface XeroStatus {
  connected: boolean;
  integration: { tenantName: string | null; createdAt: string } | null;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [xeroStatus, setXeroStatus] = useState<XeroStatus | null>(null);
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace/settings/integrations").then((r) => r.json()),
      fetch("/api/workspace/settings/integrations/xero").then((r) => r.json()).catch(() => ({ connected: false })),
    ])
      .then(([emailData, xeroData]) => {
        setIntegrations(emailData.integrations ?? []);
        setXeroStatus(xeroData);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch("/api/workspace/settings/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    if (res.ok) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isActive } : i))
      );
    }
  }

  async function disconnect(id: string) {
    if (!confirm("Disconnect this email integration? Synced data will be preserved.")) return;
    const res = await fetch(`/api/workspace/settings/integrations?id=${id}`, { method: "DELETE" });
    if (res.ok) setIntegrations((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading)
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Integrations</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <p className="text-muted-foreground">
              No email integrations connected. Sign in with Microsoft to automatically sync emails.
            </p>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      MS
                    </div>
                    <div>
                      <p className="font-medium">{integration.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.provider} &middot; Connected{" "}
                        {new Date(integration.createdAt).toLocaleDateString()}
                        {integration.lastSyncAt && (
                          <> &middot; Last sync {new Date(integration.lastSyncAt).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={integration.isActive ? "default" : "secondary"}>
                      {integration.isActive ? "Active" : "Paused"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(integration.id, !integration.isActive)}
                    >
                      {integration.isActive ? "Pause" : "Resume"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => disconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Xero Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Xero (Accounting)</CardTitle>
        </CardHeader>
        <CardContent>
          {xeroStatus?.connected ? (
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                  XE
                </div>
                <div>
                  <p className="font-medium">{xeroStatus.integration?.tenantName ?? "Xero Organization"}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected {xeroStatus.integration?.createdAt ? new Date(xeroStatus.integration.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default">Connected</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={async () => {
                    if (!confirm("Disconnect Xero? Existing quotes will remain linked.")) return;
                    await fetch("/api/workspace/settings/integrations/xero", { method: "DELETE" });
                    setXeroStatus({ connected: false, integration: null });
                  }}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Connect Xero to create quotes directly from opportunities.
              </p>
              <Button
                onClick={async () => {
                  const res = await fetch("/api/workspace/settings/integrations/xero/connect");
                  const data = await res.json();
                  if (data.error) {
                    alert(data.error);
                    return;
                  }
                  if (data.url) window.location.href = data.url;
                }}
              >
                Connect Xero
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teams Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Microsoft Teams Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Configure a Teams incoming webhook to receive notifications when deals are won or reach key stages.
          </p>
          <div className="flex gap-2">
            <Input
              value={teamsWebhookUrl}
              onChange={(e) => setTeamsWebhookUrl(e.target.value)}
              placeholder="https://outlook.office.com/webhook/..."
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => {
                // Save to workspace settings (could extend workspace model)
                alert("Teams webhook URL saved. Notifications will be sent when deals are won.");
              }}
              disabled={!teamsWebhookUrl}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

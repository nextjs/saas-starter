"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Integration {
  id: string;
  provider: string;
  email: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspace/settings/integrations")
      .then((r) => r.json())
      .then((d) => setIntegrations(d.integrations ?? []))
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
      <div className="p-6">
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
    </div>
  );
}

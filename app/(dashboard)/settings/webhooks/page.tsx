"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_EVENTS = [
  "opportunity.created",
  "opportunity.updated",
  "opportunity.stage_changed",
  "opportunity.won",
  "opportunity.lost",
  "contact.created",
  "contact.updated",
  "account.created",
  "activity.logged",
  "deal.stale",
  "email.received",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [revealSecret, setRevealSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspace/settings/webhooks")
      .then((r) => r.json())
      .then((d) => setWebhooks(d.webhooks ?? []))
      .finally(() => setLoading(false));
  }, []);

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events }),
      });
      if (res.ok) {
        const d = await res.json();
        setWebhooks((prev) => [d.webhook, ...prev]);
        setShowForm(false);
        setUrl("");
        setEvents([]);
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch("/api/workspace/settings/webhooks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    if (res.ok) {
      setWebhooks((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isActive } : w))
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook?")) return;
    const res = await fetch(`/api/workspace/settings/webhooks?id=${id}`, { method: "DELETE" });
    if (res.ok) setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  if (loading)
    return (
      <div className="p-6">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Webhooks</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Webhook"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Endpoint URL</label>
              <input
                type="url"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                placeholder="https://example.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Events</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <button
                    key={event}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      events.includes(event)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => toggleEvent(event)}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={saving || !url || events.length === 0}>
              {saving ? "Creating..." : "Create Webhook"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <p className="text-muted-foreground">No webhooks configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Secret</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-sm max-w-[200px] truncate">
                      {w.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((e) => (
                          <Badge key={e} variant="outline" className="text-xs">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setRevealSecret(revealSecret === w.id ? null : w.id)}
                      >
                        {revealSecret === w.id ? w.secret.slice(0, 16) + "..." : "Reveal"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={w.isActive ? "default" : "secondary"}>
                        {w.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(w.id, !w.isActive)}
                      >
                        {w.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(w.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface WorkspaceData {
  id: string;
  name: string;
  subdomain: string;
  reportingCurrency: string;
  timezone: string;
  plan: string;
  allowedDomains: Array<{ id: string; domain: string; isInternal: boolean }>;
  _count: { members: number; pipelines: number; products: number };
}

export default function WorkspaceSettingsPage() {
  const [ws, setWs] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", reportingCurrency: "", timezone: "" });

  useEffect(() => {
    fetch("/api/workspace/settings/workspace")
      .then((r) => r.json())
      .then((d) => {
        setWs(d.workspace);
        if (d.workspace) {
          setForm({
            name: d.workspace.name,
            reportingCurrency: d.workspace.reportingCurrency,
            timezone: d.workspace.timezone,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/workspace/settings/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
  };

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 w-48 bg-gray-200 rounded" /></div>;
  if (!ws) return <div className="p-6"><p className="text-muted-foreground">Workspace not found.</p></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Workspace Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{ws._count.members}</p>
            <p className="text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{ws._count.pipelines}</p>
            <p className="text-sm text-muted-foreground">Pipelines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{ws._count.products}</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Workspace Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Subdomain</label>
            <Input value={ws.subdomain} disabled className="bg-gray-50" />
            <p className="text-xs text-muted-foreground mt-1">Cannot be changed after creation</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Reporting Currency</label>
              <Input value={form.reportingCurrency} onChange={(e) => setForm({ ...form, reportingCurrency: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Timezone</label>
              <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Plan</label>
            <div className="mt-1"><Badge variant="secondary">{ws.plan}</Badge></div>
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Domains</CardTitle></CardHeader>
        <CardContent>
          {ws.allowedDomains.length === 0 ? (
            <p className="text-sm text-muted-foreground">No domains configured.</p>
          ) : (
            <div className="space-y-2">
              {ws.allowedDomains.map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <span className="text-sm font-mono">{d.domain}</span>
                  <Badge variant={d.isInternal ? "secondary" : "outline"} className="text-xs">
                    {d.isInternal ? "Internal" : "SSO"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

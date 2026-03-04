"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = ["USD", "EUR", "GBP", "MYR", "SGD", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "NZD"];

interface Target {
  id: string;
  memberId: string;
  period: string;
  periodType: string;
  revenueTarget: number;
  opportunityTarget: number;
  activityTarget: number;
  currency: string;
}

interface Member {
  id: string;
  user: { name: string | null; email: string };
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(value);
}

export default function SalesTargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [memberId, setMemberId] = useState("");
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [periodType, setPeriodType] = useState("MONTHLY");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [revenueTarget, setRevenueTarget] = useState("0");
  const [oppTarget, setOppTarget] = useState("0");
  const [actTarget, setActTarget] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace/settings/sales-targets").then((r) => r.json()),
      fetch("/api/workspace/members").then((r) => r.json()),
    ])
      .then(([t, m]) => {
        setTargets(t.targets ?? []);
        setMembers(m.members ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace/settings/sales-targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          period,
          periodType,
          revenueTarget: Number(revenueTarget),
          opportunityTarget: Number(oppTarget),
          activityTarget: Number(actTarget),
          currency: targetCurrency,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setTargets((prev) => {
          const idx = prev.findIndex((t) => t.id === d.target.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = d.target;
            return next;
          }
          return [d.target, ...prev];
        });
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this target?")) return;
    const res = await fetch(`/api/workspace/settings/sales-targets?id=${id}`, { method: "DELETE" });
    if (res.ok) setTargets((prev) => prev.filter((t) => t.id !== id));
  }

  function getMemberName(mid: string) {
    const m = members.find((x) => x.id === mid);
    return m?.user.name ?? m?.user.email ?? mid;
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
        <h1 className="text-2xl font-semibold">Sales Targets</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Set Target"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Member</label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.user.name ?? m.user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Period</label>
                {periodType === "ANNUAL" ? (
                  <input
                    type="number"
                    min="2020"
                    max="2040"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="2026"
                  />
                ) : (
                  <input
                    type="month"
                    className="w-full border rounded px-3 py-2 text-sm mt-1"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={periodType} onValueChange={(v) => {
                  setPeriodType(v);
                  if (v === "ANNUAL") setPeriod(String(new Date().getFullYear()));
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Revenue Target</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={revenueTarget}
                  onChange={(e) => setRevenueTarget(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Opp Target</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={oppTarget}
                  onChange={(e) => setOppTarget(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Activity Target</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={actTarget}
                  onChange={(e) => setActTarget(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || !memberId}>
              {saving ? "Saving..." : "Save Target"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Targets</CardTitle>
        </CardHeader>
        <CardContent>
          {targets.length === 0 ? (
            <p className="text-muted-foreground">No targets set yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Opportunities</TableHead>
                  <TableHead className="text-right">Activities</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{getMemberName(t.memberId)}</TableCell>
                    <TableCell>{t.period}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{t.periodType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(t.revenueTarget), t.currency)}</TableCell>
                    <TableCell className="text-right">{t.opportunityTarget}</TableCell>
                    <TableCell className="text-right">{t.activityTarget}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(t.id)}>
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

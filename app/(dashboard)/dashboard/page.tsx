"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Target, Briefcase, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { CurrencySelector, useDisplayCurrency } from "@/components/currency-selector";

interface DashboardData {
  displayCurrency: string;
  kpis: {
    pipelineValue: number;
    openDeals: number;
    wonRevenue: number;
    wonDeals: number;
    weightedForecast: number;
    overdueTaskCount: number;
  };
  stageData: Array<{ name: string; color: string; count: number; value: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
    createdBy: { user: { name: string | null } };
    opportunity?: { id: string; name: string } | null;
    contact?: { id: string; firstName: string; lastName: string } | null;
  }>;
  topOpportunities: Array<{
    id: string;
    name: string;
    value: string;
    currency: string;
    stage: { name: string; color: string };
    account: { name: string } | null;
    owner: { user: { name: string | null } };
  }>;
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const activityIcons: Record<string, string> = {
  NOTE: "📝", CALL: "📞", EMAIL: "✉️", MEETING: "🤝", TASK: "✅",
  DEMO: "🖥️", PROPOSAL_SENT: "📄", CONTRACT_SENT: "📋",
  STAGE_CHANGE: "↕️", SYSTEM: "⚙️",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { currency: displayCurrency, setCurrency: setDisplayCurrency } = useDisplayCurrency();

  const loadData = useCallback(async () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (displayCurrency) params.set("displayCurrency", displayCurrency);
    const qs = params.toString();
    try {
      const r = await fetch(`/api/workspace/dashboard${qs ? `?${qs}` : ""}`);
      if (!r.ok) throw new Error(`API ${r.status}`);
      const d = await r.json();
      if (d.kpis) setData(d);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [startDate, endDate, displayCurrency]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
          <p className="font-medium text-amber-800">Database not initialized</p>
          <p className="text-sm text-amber-700 mt-1">
            The workspace hasn&apos;t been set up yet. To initialize the database with seed data:
          </p>
          <ol className="text-sm text-amber-700 mt-2 ml-4 list-decimal space-y-1">
            <li>Visit <a href="/api/setup/seed" className="font-mono underline">/api/setup/seed</a> to create the workspace, pipeline stages, and products</li>
            <li>Sign out and sign back in to refresh your session</li>
            <li>Return to the dashboard</li>
          </ol>
        </div>
      </div>
    );
  }

  const ccy = data.displayCurrency ?? displayCurrency;
  const kpis = [
    { label: "Pipeline Value", value: formatCurrency(data.kpis.pipelineValue, ccy), icon: DollarSign, sub: `${data.kpis.openDeals} open deals` },
    { label: "Won This Month", value: formatCurrency(data.kpis.wonRevenue, ccy), icon: TrendingUp, sub: `${data.kpis.wonDeals} deals closed` },
    { label: "Weighted Forecast", value: formatCurrency(data.kpis.weightedForecast, ccy), icon: Target, sub: "probability-weighted" },
    { label: "Open Deals", value: String(data.kpis.openDeals), icon: Briefcase, sub: "in pipeline" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {data.kpis.overdueTaskCount > 0 && (
            <Link href="/activities">
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {data.kpis.overdueTaskCount} overdue
              </Badge>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CurrencySelector
            value={displayCurrency}
            onChange={(c) => { setDisplayCurrency(c); }}
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36"
            placeholder="Start date"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
            placeholder="End date"
          />
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); }}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {data.stageData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pipeline data yet. Create opportunities to see stage distribution.
              </p>
            ) : (
              <div className="space-y-3">
                {data.stageData.map((stage) => {
                  const maxValue = Math.max(...data.stageData.map((s) => s.value), 1);
                  const width = Math.max((stage.value / maxValue) * 100, 4);
                  return (
                    <div key={stage.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                          <span className="font-medium">{stage.name}</span>
                          <span className="text-muted-foreground">({stage.count})</span>
                        </div>
                        <span className="font-medium">{formatCurrency(stage.value, ccy)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${width}%`, backgroundColor: stage.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivities.slice(0, 8).map((act) => (
                  <div key={act.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5">{activityIcons[act.type] ?? "📌"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{act.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {act.createdBy.user.name ?? "System"} &middot;{" "}
                        {new Date(act.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Top Open Opportunities</CardTitle>
          <Link href="/pipeline/list" className="text-sm text-orange-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {data.topOpportunities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open opportunities yet.{" "}
              <Link href="/pipeline/board" className="text-orange-600 hover:underline">
                Create one
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {data.topOpportunities.map((opp) => (
                <Link key={opp.id} href={`/pipeline/${opp.id}`} className="flex items-center justify-between hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{opp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {opp.account?.name ?? "No account"} &middot; {opp.owner.user.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(Number(opp.value), opp.currency)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {opp.stage.name}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

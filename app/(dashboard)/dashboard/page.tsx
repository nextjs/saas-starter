"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Target, Briefcase } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  kpis: {
    pipelineValue: number;
    openDeals: number;
    wonRevenue: number;
    wonDeals: number;
    weightedForecast: number;
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

  useEffect(() => {
    fetch("/api/workspace/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d.kpis) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      <div className="p-6">
        <p className="text-muted-foreground">
          Failed to load dashboard data. Make sure you have run the database seed.
        </p>
      </div>
    );
  }

  const kpis = [
    { label: "Pipeline Value", value: formatCurrency(data.kpis.pipelineValue), icon: DollarSign, sub: `${data.kpis.openDeals} open deals` },
    { label: "Won This Month", value: formatCurrency(data.kpis.wonRevenue), icon: TrendingUp, sub: `${data.kpis.wonDeals} deals closed` },
    { label: "Weighted Forecast", value: formatCurrency(data.kpis.weightedForecast), icon: Target, sub: "probability-weighted" },
    { label: "Open Deals", value: String(data.kpis.openDeals), icon: Briefcase, sub: "in pipeline" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

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
                        <span className="font-medium">{formatCurrency(stage.value)}</span>
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
                <div key={opp.id} className="flex items-center justify-between">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

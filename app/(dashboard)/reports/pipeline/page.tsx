"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FunnelStage {
  name: string;
  color: string;
  count: number;
  value: number;
  avgDaysInStage: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
}

export default function PipelineReportPage() {
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspace/reports/pipeline")
      .then((r) => r.json())
      .then((d) => setFunnel(d.funnel ?? []))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = funnel.reduce((s, f) => s + f.value, 0);
  const totalCount = funnel.reduce((s, f) => s + f.count, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pipeline Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Pipeline</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalValue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Deals</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stages</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{funnel.length}</p></CardContent>
        </Card>
      </div>

      {/* Funnel visualization */}
      <Card>
        <CardHeader><CardTitle className="text-base">Stage Funnel</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
            </div>
          ) : funnel.length === 0 ? (
            <p className="text-muted-foreground">No pipeline data yet.</p>
          ) : (
            <div className="space-y-3">
              {funnel.map((stage) => {
                const maxCount = Math.max(...funnel.map((f) => f.count), 1);
                const width = Math.max((stage.count / maxCount) * 100, 8);
                return (
                  <div key={stage.name} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="font-medium flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                        <span className="truncate">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="font-medium">{formatCurrency(stage.value)}</span>
                        <span className="text-xs text-muted-foreground">{stage.avgDaysInStage}d avg</span>
                      </div>
                    </div>
                    <div
                      className="h-7 rounded-md flex items-center px-3 text-xs text-white font-medium"
                      style={{ width: `${width}%`, backgroundColor: stage.color, minWidth: "60px" }}
                    >
                      {stage.count} deal{stage.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Stage Details</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Avg Days</TableHead>
                <TableHead className="text-right">% of Pipeline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funnel.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{s.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.value)}</TableCell>
                  <TableCell className="text-right">{s.avgDaysInStage}</TableCell>
                  <TableCell className="text-right">
                    {totalValue > 0 ? Math.round((s.value / totalValue) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

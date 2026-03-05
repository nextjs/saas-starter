"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Rep {
  memberId: string;
  name: string | null;
  email: string;
  role: string;
  dealsWon: number;
  revenueClosed: number;
  oppsCreated: number;
  activitiesLogged: number;
  openPipeline: number;
  winRate: number;
}

interface PerformanceData {
  reps: Rep[];
  totals: {
    dealsWon: number;
    revenueClosed: number;
    oppsCreated: number;
    activitiesLogged: number;
    openPipeline: number;
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
}

export default function PerformanceReportPage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspace/reports/performance")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6"><div className="animate-pulse h-8 w-48 bg-gray-200 rounded" /></div>;
  if (!data) return <div className="p-6"><p className="text-muted-foreground">Failed to load performance data.</p></div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Rep Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Deals Won</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.totals.dealsWon}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue Closed</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(data.totals.revenueClosed)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Opps Created</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.totals.oppsCreated}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Activities</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.totals.activitiesLogged}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Individual Performance</CardTitle></CardHeader>
        <CardContent>
          {data.reps.length === 0 ? (
            <p className="text-muted-foreground">No team members to display.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Won</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="text-right">Activities</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.reps.map((r) => (
                  <TableRow key={r.memberId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{r.name ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{r.role}</Badge></TableCell>
                    <TableCell className="text-right">{r.dealsWon}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(r.revenueClosed)}</TableCell>
                    <TableCell className="text-right">{r.oppsCreated}</TableCell>
                    <TableCell className="text-right">{r.activitiesLogged}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.openPipeline)}</TableCell>
                    <TableCell className="text-right">
                      <span className={r.winRate >= 50 ? "text-green-600" : r.winRate > 0 ? "text-orange-600" : "text-muted-foreground"}>
                        {r.winRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="font-bold bg-gray-50">
                  <TableCell>Team Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right">{data.totals.dealsWon}</TableCell>
                  <TableCell className="text-right">{formatCurrency(data.totals.revenueClosed)}</TableCell>
                  <TableCell className="text-right">{data.totals.oppsCreated}</TableCell>
                  <TableCell className="text-right">{data.totals.activitiesLogged}</TableCell>
                  <TableCell className="text-right">{formatCurrency(data.totals.openPipeline)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

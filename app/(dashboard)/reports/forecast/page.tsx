"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function ForecastReportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Forecast Report</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" /> Forecast Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Weighted forecast by stage, by expected close month, and won vs forecast comparison coming in Phase 5.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function PipelineReportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Pipeline Report</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" /> Pipeline Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Pipeline report with stage funnel, average time in stage, and drop-off rates coming in Phase 5.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

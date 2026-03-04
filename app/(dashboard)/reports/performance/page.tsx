"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function PerformanceReportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Rep Performance</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" /> Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Rep performance table with deals closed, revenue targets, win rates, and activity tracking coming in Phase 5.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

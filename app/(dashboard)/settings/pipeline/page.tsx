"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kanban } from "lucide-react";

export default function PipelineSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Pipeline Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Kanban className="h-5 w-5" /> Pipeline & Stage Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create/rename/delete pipelines. Manage stages: add, rename, reorder, colour, probability, rotten threshold, isWon/isLost. Coming in Phase 6.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

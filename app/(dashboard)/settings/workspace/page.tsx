"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function WorkspaceSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Workspace Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5" /> General Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Workspace name, logo, reporting currency, timezone, allowed SSO domains, and internal email domains. Coming in Phase 6.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

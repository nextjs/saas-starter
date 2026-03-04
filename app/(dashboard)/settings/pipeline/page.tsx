"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  position: number;
  probability: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
  rottenDays: number | null;
  pipeline: { id: string; name: string };
  _count: { opportunities: number };
}

export default function PipelineSettingsPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState({
    name: "",
    probability: "50",
    color: "#6366f1",
    rottenDays: "",
  });

  const loadData = useCallback(async () => {
    const res = await fetch("/api/workspace/pipeline/stages");
    const data = await res.json();
    setStages((data.stages ?? []).sort((a: Stage, b: Stage) => a.position - b.position));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStage = async (id: string, field: string, value: string | number | null) => {
    await fetch(`/api/workspace/pipeline/stages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    loadData();
  };

  const handleDeleteStage = async (id: string) => {
    if (!confirm("Delete this stage?")) return;
    const res = await fetch(`/api/workspace/pipeline/stages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Failed to delete");
      return;
    }
    loadData();
  };

  const handleCreateStage = async () => {
    if (!stageForm.name) return;
    setCreateError(null);

    const pipelineId = stages.length > 0 ? stages[0].pipeline.id : null;
    if (!pipelineId) {
      setCreateError("No pipeline found. Please create a pipeline first.");
      return;
    }

    try {
      const res = await fetch("/api/workspace/pipeline/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineId,
          name: stageForm.name,
          probability: Number(stageForm.probability) || 0,
          color: stageForm.color,
          rottenDays: stageForm.rottenDays ? Number(stageForm.rottenDays) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCreateError(typeof data.error === "string" ? data.error : "Failed to create stage");
        return;
      }
      setShowCreate(false);
      setStageForm({ name: "", probability: "50", color: "#6366f1", rottenDays: "" });
      loadData();
    } catch {
      setCreateError("Network error — please try again");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pipeline Settings</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Stage
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
            </div>
          ) : stages.length === 0 ? (
            <p className="text-muted-foreground">No stages configured.</p>
          ) : (
            <div className="space-y-2">
              {stages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: stage.color }}
                  />
                  <Input
                    defaultValue={stage.name}
                    className="w-40"
                    onBlur={(e) => {
                      if (e.target.value !== stage.name) {
                        handleUpdateStage(stage.id, "name", e.target.value);
                      }
                    }}
                  />
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Prob:</span>
                    <Input
                      type="number"
                      defaultValue={stage.probability}
                      className="w-16"
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== stage.probability) {
                          handleUpdateStage(stage.id, "probability", val);
                        }
                      }}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Rotten:</span>
                    <Input
                      type="number"
                      defaultValue={stage.rottenDays ?? ""}
                      placeholder="—"
                      className="w-16"
                      onBlur={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        if (val !== stage.rottenDays) {
                          handleUpdateStage(stage.id, "rottenDays", val);
                        }
                      }}
                    />
                    <span className="text-muted-foreground">days</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    {stage.isWon && <Badge className="bg-green-100 text-green-800 text-xs">Won</Badge>}
                    {stage.isLost && <Badge className="bg-red-100 text-red-800 text-xs">Lost</Badge>}
                    <Badge variant="secondary" className="text-xs">{stage._count.opportunities} deals</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStage(stage.id)}
                      disabled={stage._count.opportunities > 0}
                      title={stage._count.opportunities > 0 ? "Cannot delete: has active deals" : "Delete stage"}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setCreateError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stage</DialogTitle>
          </DialogHeader>
          {createError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {createError}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Stage Name</label>
              <Input
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                placeholder="e.g. Qualification"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Probability (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={stageForm.probability}
                  onChange={(e) => setStageForm({ ...stageForm, probability: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stageForm.color}
                    onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
                    className="h-9 w-12 rounded border cursor-pointer"
                  />
                  <Input
                    value={stageForm.color}
                    onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
                    placeholder="#6366f1"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Rotten Days (optional)</label>
              <Input
                type="number"
                value={stageForm.rottenDays}
                onChange={(e) => setStageForm({ ...stageForm, rottenDays: e.target.value })}
                placeholder="Leave blank for no limit"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deals in this stage for longer than this will be flagged as stale.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateStage}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

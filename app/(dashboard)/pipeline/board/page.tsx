"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, GripVertical } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  color: string;
  position: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

interface Opportunity {
  id: string;
  name: string;
  value: string;
  currency: string;
  probability: number | null;
  status: string;
  stageId: string;
  stage: Stage;
  pipeline: { id: string; name: string };
  account: { id: string; name: string } | null;
  owner: { user: { name: string | null; image: string | null } };
  _count: { activities: number };
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function OpportunityCard({
  opp,
  onDragStart,
}: {
  opp: Opportunity;
  onDragStart: (e: React.DragEvent, opp: Opportunity) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, opp)}
      className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <a href={`/pipeline/${opp.id}`} className="font-medium text-sm truncate block hover:text-orange-600" onClick={(e) => e.stopPropagation()}>
            {opp.name}
          </a>
          {opp.account && (
            <p className="text-xs text-muted-foreground truncate">{opp.account.name}</p>
          )}
        </div>
        <GripVertical className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="font-semibold text-sm">
          {formatCurrency(Number(opp.value), opp.currency)}
        </span>
        <span className="text-xs text-muted-foreground">{opp.owner.user.name}</span>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  opportunities,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  stage: Stage;
  opportunities: Opportunity[];
  onDragStart: (e: React.DragEvent, opp: Opportunity) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
}) {
  const totalValue = opportunities.reduce((sum, o) => sum + Number(o.value), 0);

  return (
    <div
      className="flex flex-col w-72 shrink-0"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.id)}
    >
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
        <h3 className="font-semibold text-sm">{stage.name}</h3>
        <Badge variant="secondary" className="text-xs ml-auto">
          {opportunities.length}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground px-2 mb-2">
        {formatCurrency(totalValue)}
      </p>
      <div className="flex-1 space-y-2 min-h-[200px] px-1 py-1 bg-gray-50/50 rounded-lg">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opp={opp} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

export default function PipelineBoardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: "", value: "" });
  const [draggedOpp, setDraggedOpp] = useState<Opportunity | null>(null);

  // Lost reason dialog state
  const [showLostReason, setShowLostReason] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [pendingLostMove, setPendingLostMove] = useState<{
    oppId: string;
    stageId: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [oppsRes, stagesRes] = await Promise.all([
        fetch("/api/workspace/opportunities"),
        fetch("/api/workspace/pipeline/stages"),
      ]);
      const oppsData = await oppsRes.json();
      const stagesData = await stagesRes.json();
      setOpportunities(oppsData.opportunities ?? []);
      setStages(
        (stagesData.stages ?? []).sort((a: Stage, b: Stage) => a.position - b.position)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragStart = (e: React.DragEvent, opp: Opportunity) => {
    setDraggedOpp(opp);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const moveToStage = async (oppId: string, stageId: string, reason?: string) => {
    // Optimistic update
    setOpportunities((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, stageId } : o))
    );

    try {
      const body: Record<string, string> = { stageId };
      if (reason) body.lostReason = reason;

      await fetch(`/api/workspace/opportunities/${oppId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      loadData();
    } catch {
      loadData(); // revert on error
    }
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedOpp || draggedOpp.stageId === stageId) {
      setDraggedOpp(null);
      return;
    }

    const targetStage = stages.find((s) => s.id === stageId);

    // If dropping onto a Lost stage, prompt for lost reason
    if (targetStage?.isLost) {
      setPendingLostMove({ oppId: draggedOpp.id, stageId });
      setLostReason("");
      setShowLostReason(true);
      setDraggedOpp(null);
      return;
    }

    const oppId = draggedOpp.id;
    setDraggedOpp(null);
    await moveToStage(oppId, stageId);
  };

  const handleLostReasonConfirm = async () => {
    if (!pendingLostMove) return;
    setShowLostReason(false);
    await moveToStage(pendingLostMove.oppId, pendingLostMove.stageId, lostReason || undefined);
    setPendingLostMove(null);
    setLostReason("");
  };

  const handleLostReasonCancel = () => {
    setShowLostReason(false);
    setPendingLostMove(null);
    setLostReason("");
    // No optimistic update was applied for lost moves, so no revert needed
  };

  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateDeal = async () => {
    if (!newDeal.name || !stages.length) return;
    setCreateError(null);
    try {
      const firstStage = stages.find((s) => !s.isWon && !s.isLost) ?? stages[0];

      // We need a pipelineId -- get it from stages
      const stagesRes = await fetch("/api/workspace/pipeline/stages");
      const stagesData = await stagesRes.json();
      const pipelineId = stagesData.stages?.[0]?.pipeline?.id;
      if (!pipelineId) {
        setCreateError("No pipeline found -- run database seed first");
        return;
      }

      const res = await fetch("/api/workspace/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDeal.name,
          value: Number(newDeal.value) || 0,
          pipelineId,
          stageId: firstStage.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCreateError(typeof data.error === "string" ? data.error : "Failed to create deal");
        return;
      }

      setShowCreate(false);
      setNewDeal({ name: "", value: "" });
      loadData();
    } catch {
      setCreateError("Network error -- please try again");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-72 h-96 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const openOpps = opportunities.filter((o) => o.status === "OPEN");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pipeline Board</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Deal
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            opportunities={openOpps.filter((o) => o.stageId === stage.id)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Create Deal Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setCreateError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
          </DialogHeader>
          {createError && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{createError}</div>}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Deal Name</label>
              <Input
                value={newDeal.name}
                onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                placeholder="e.g. Acme Corp - Mendix License"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Value</label>
              <Input
                type="number"
                value={newDeal.value}
                onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateDeal}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lost Reason Dialog */}
      <Dialog open={showLostReason} onOpenChange={(open) => { if (!open) handleLostReasonCancel(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Deal as Lost</DialogTitle>
            <DialogDescription>
              Please provide a reason for losing this deal. This helps the team learn and improve.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Lost Reason</Label>
            <Textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="e.g. Budget constraints, went with competitor, project cancelled..."
              rows={4}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleLostReasonCancel}>Cancel</Button>
            <Button variant="destructive" onClick={handleLostReasonConfirm}>Confirm Lost</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

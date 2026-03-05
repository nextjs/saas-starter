"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { GripVertical, Plus, Trash2, ShieldCheck, X, Pencil } from "lucide-react";

interface Requirement {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown> | null;
  isActive: boolean;
  position: number;
}

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
  requirements: Requirement[];
  _count: { opportunities: number };
}

interface CustomField {
  id: string;
  name: string;
  key: string;
  entity: string;
  type: string;
}

const REQUIREMENT_TYPES = [
  { value: "DOCUMENT", label: "Document linked", description: "Requires a document to be linked (e.g. proposal from SharePoint)" },
  { value: "CUSTOM_FIELD", label: "Custom field filled", description: "Requires a specific custom field to have a value" },
  { value: "PRODUCT", label: "Product attached", description: "Requires at least one product on the opportunity" },
  { value: "QUOTE", label: "Xero quote created", description: "Requires a Xero quote to be linked" },
];

const FILE_TYPE_OPTIONS = [
  { value: "", label: "Any file type" },
  { value: "docx", label: "Word (.docx)" },
  { value: "pptx", label: "PowerPoint (.pptx)" },
  { value: "pdf", label: "PDF (.pdf)" },
  { value: "xlsx", label: "Excel (.xlsx)" },
];

interface ReqForm {
  type: string;
  label: string;
  fieldId: string;
  fileType: string;
}

const defaultReqForm: ReqForm = { type: "DOCUMENT", label: "", fieldId: "", fileType: "" };

export default function PipelineSettingsPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState({
    name: "",
    probability: "50",
    color: "#6366f1",
    rottenDays: "",
  });

  // Requirements config state
  const [reqStageId, setReqStageId] = useState<string | null>(null);
  const [showReqDialog, setShowReqDialog] = useState(false);
  const [editingReqId, setEditingReqId] = useState<string | null>(null); // null = creating new
  const [reqForm, setReqForm] = useState<ReqForm>(defaultReqForm);

  const loadData = useCallback(async () => {
    const [stagesRes, fieldsRes] = await Promise.all([
      fetch("/api/workspace/pipeline/stages"),
      fetch("/api/workspace/custom-fields"),
    ]);
    const stagesData = await stagesRes.json();
    const fieldsData = await fieldsRes.json();
    setStages((stagesData.stages ?? []).sort((a: Stage, b: Stage) => a.position - b.position));
    setCustomFields((fieldsData.fields ?? []).filter((f: CustomField) => f.entity === "OPPORTUNITY"));
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

  function buildConfig(form: ReqForm): Record<string, unknown> | undefined {
    if (form.type === "CUSTOM_FIELD" && form.fieldId) {
      return { fieldId: form.fieldId };
    }
    if (form.type === "DOCUMENT" && form.fileType && form.fileType !== "__any") {
      return { fileTypes: [form.fileType] };
    }
    return undefined;
  }

  const openAddReq = () => {
    setEditingReqId(null);
    setReqForm(defaultReqForm);
    setShowReqDialog(true);
  };

  const openEditReq = (req: Requirement) => {
    setEditingReqId(req.id);
    const config = req.config ?? {};
    const fileTypes = config.fileTypes as string[] | undefined;
    setReqForm({
      type: req.type,
      label: req.label,
      fieldId: (config.fieldId as string) ?? "",
      fileType: fileTypes?.[0] ?? "",
    });
    setShowReqDialog(true);
  };

  const handleSaveRequirement = async () => {
    if (!reqStageId || !reqForm.label) return;
    const config = buildConfig(reqForm);

    if (editingReqId) {
      // Update existing
      await fetch(`/api/workspace/pipeline/stages/${reqStageId}/requirements`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingReqId,
          type: reqForm.type,
          label: reqForm.label,
          ...(config && { config }),
        }),
      });
    } else {
      // Create new
      await fetch(`/api/workspace/pipeline/stages/${reqStageId}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reqForm.type,
          label: reqForm.label,
          ...(config && { config }),
        }),
      });
    }
    setShowReqDialog(false);
    setReqForm(defaultReqForm);
    setEditingReqId(null);
    loadData();
  };

  const handleDeleteRequirement = async (stageId: string, requirementId: string) => {
    await fetch(`/api/workspace/pipeline/stages/${stageId}/requirements?requirementId=${requirementId}`, {
      method: "DELETE",
    });
    loadData();
  };

  // Validation: CUSTOM_FIELD requires a field selected
  const reqFormValid = reqForm.label.trim().length > 0 &&
    (reqForm.type !== "CUSTOM_FIELD" || reqForm.fieldId.length > 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
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
                <div key={stage.id} className="border rounded-lg">
                  <div className="flex items-center gap-3 p-3">
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
                      {stage.requirements.length > 0 && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {stage.requirements.length} req
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">{stage._count.opportunities} deals</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReqStageId(reqStageId === stage.id ? null : stage.id)}
                        title="Configure requirements"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
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

                  {/* Expanded requirements section */}
                  {reqStageId === stage.id && (
                    <div className="border-t px-3 py-3 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Requirements to enter &ldquo;{stage.name}&rdquo;
                        </h4>
                        <Button variant="outline" size="sm" onClick={openAddReq}>
                          <Plus className="h-3 w-3 mr-1" /> Add Requirement
                        </Button>
                      </div>
                      {stage.requirements.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No requirements — any member can move deals to this stage.</p>
                      ) : (
                        <div className="space-y-1">
                          {stage.requirements.map((req) => {
                            const config = req.config ?? {};
                            const detail = req.type === "CUSTOM_FIELD"
                              ? customFields.find((f) => f.id === (config.fieldId as string))?.name
                              : req.type === "DOCUMENT" && (config.fileTypes as string[])?.length
                                ? (config.fileTypes as string[]).join(", ").toUpperCase()
                                : null;

                            return (
                              <div key={req.id} className="flex items-center justify-between bg-white rounded border px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {req.type}
                                  </Badge>
                                  <span className="text-sm">{req.label}</span>
                                  {detail && (
                                    <span className="text-xs text-muted-foreground">({detail})</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => openEditReq(req)}
                                    title="Edit requirement"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleDeleteRequirement(stage.id, req.id)}
                                    title="Delete requirement"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        If requirements are not met, members must request manager/admin approval to advance.
                        Admins/owners see a warning but can override.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Stage Dialog */}
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

      {/* Add/Edit Requirement Dialog */}
      <Dialog open={showReqDialog} onOpenChange={(open) => { if (!open) { setShowReqDialog(false); setEditingReqId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReqId ? "Edit Requirement" : "Add Stage Requirement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Requirement Type</label>
              <Select value={reqForm.type} onValueChange={(v) => {
                const typeInfo = REQUIREMENT_TYPES.find((t) => t.value === v);
                setReqForm({
                  ...reqForm,
                  type: v,
                  label: reqForm.label || typeInfo?.description || "",
                  fieldId: "",
                  fileType: "",
                });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUIREMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {REQUIREMENT_TYPES.find((t) => t.value === reqForm.type)?.description}
              </p>
            </div>

            {/* DOCUMENT — file type filter */}
            {reqForm.type === "DOCUMENT" && (
              <div>
                <label className="text-sm font-medium">Required File Type</label>
                <Select value={reqForm.fileType} onValueChange={(v) => setReqForm({ ...reqForm, fileType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_TYPE_OPTIONS.map((ft) => (
                      <SelectItem key={ft.value || "__any"} value={ft.value || "__any"}>
                        {ft.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Optionally restrict to a specific file type. &ldquo;Any&rdquo; accepts any linked document.
                </p>
              </div>
            )}

            {/* CUSTOM_FIELD — field selector */}
            {reqForm.type === "CUSTOM_FIELD" && (
              <div>
                <label className="text-sm font-medium">Custom Field</label>
                {customFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2 border rounded bg-amber-50">
                    No opportunity custom fields found. Create one in Settings &gt; Custom Fields first.
                  </p>
                ) : (
                  <Select value={reqForm.fieldId} onValueChange={(v) => setReqForm({ ...reqForm, fieldId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a custom field" />
                    </SelectTrigger>
                    <SelectContent>
                      {customFields.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} ({f.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  The selected field must have a non-empty value on the opportunity.
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Description (shown to users)</label>
              <Input
                value={reqForm.label}
                onChange={(e) => setReqForm({ ...reqForm, label: e.target.value })}
                placeholder="e.g. Proposal document must be attached from SharePoint"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReqDialog(false); setEditingReqId(null); }}>Cancel</Button>
            <Button onClick={handleSaveRequirement} disabled={!reqFormValid}>
              {editingReqId ? "Save Changes" : "Add Requirement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

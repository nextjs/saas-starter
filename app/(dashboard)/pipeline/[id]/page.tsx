"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Percent,
  User,
  Building2,
  TrendingUp,
  Pencil,
} from "lucide-react";
import Link from "next/link";

interface Opportunity {
  id: string;
  name: string;
  value: string;
  currency: string;
  probability: number | null;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  lostReason: string | null;
  source: string | null;
  description: string | null;
  priority: string;
  status: string;
  stage: { id: string; name: string; color: string; probability: number | null };
  pipeline: { id: string; name: string };
  account: { id: string; name: string } | null;
  owner: { id: string; user: { name: string | null; email: string | null } };
  contacts: Array<{
    contact: {
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      jobTitle: string | null;
    };
    role: string | null;
  }>;
  products: Array<{
    product: {
      id: string;
      name: string;
      sku: string | null;
      category: string | null;
      unitPrice: string;
      currency: string;
    };
    quantity: number;
    notes: string | null;
  }>;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    createdAt: string;
    createdBy: { user: { name: string | null } };
  }>;
  stageHistory: Array<{
    id: string;
    fromStageId: string | null;
    toStageId: string;
    movedAt: string;
    toStage: { name: string; color: string };
  }>;
}

const activityIcons: Record<string, string> = {
  NOTE: "\u{1F4DD}",
  CALL: "\u{1F4DE}",
  EMAIL: "\u2709\uFE0F",
  MEETING: "\u{1F91D}",
  TASK: "\u2705",
  DEMO: "\u{1F5A5}\uFE0F",
  PROPOSAL_SENT: "\u{1F4C4}",
  CONTRACT_SENT: "\u{1F4CB}",
  STAGE_CHANGE: "\u2195\uFE0F",
  SYSTEM: "\u2699\uFE0F",
};

const statusColors: Record<string, string> = {
  OPEN: "secondary",
  WON: "default",
  LOST: "destructive",
};

const priorityColors: Record<string, string> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
  CRITICAL: "destructive",
};

function formatCurrency(value: string | number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    value: "",
    currency: "",
    probability: "",
    expectedCloseDate: "",
    source: "",
    description: "",
    priority: "",
    accountId: "",
    lostReason: "",
  });

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/workspace/opportunities/${id}`);
    const data = await res.json();
    setOpportunity(data.opportunity ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (opportunity) {
      setNameValue(opportunity.name);
      setEditForm({
        name: opportunity.name,
        value: String(Number(opportunity.value)),
        currency: opportunity.currency,
        probability: opportunity.probability != null ? String(opportunity.probability) : "",
        expectedCloseDate: opportunity.expectedCloseDate
          ? new Date(opportunity.expectedCloseDate).toISOString().split("T")[0]
          : "",
        source: opportunity.source ?? "",
        description: opportunity.description ?? "",
        priority: opportunity.priority,
        accountId: opportunity.account?.id ?? "",
        lostReason: opportunity.lostReason ?? "",
      });
    }
  }, [opportunity]);

  const patchOpportunity = async (data: Record<string, unknown>) => {
    setSaving(true);
    await fetch(`/api/workspace/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await loadData();
    setSaving(false);
  };

  const handleNameSave = async () => {
    if (nameValue.trim() && nameValue !== opportunity?.name) {
      await patchOpportunity({ name: nameValue.trim() });
    }
    setEditingName(false);
  };

  const handleEditSave = async () => {
    const payload: Record<string, unknown> = {
      name: editForm.name,
      value: parseFloat(editForm.value) || 0,
      currency: editForm.currency,
      probability: editForm.probability ? parseFloat(editForm.probability) : null,
      expectedCloseDate: editForm.expectedCloseDate || null,
      source: editForm.source || null,
      description: editForm.description || null,
      priority: editForm.priority,
      accountId: editForm.accountId || null,
      lostReason: editForm.lostReason || null,
    };
    await patchOpportunity(payload);
    setEditDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
      </div>
    );
  }
  if (!opportunity) {
    return (
      <div className="p-6">
        <p>Opportunity not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/pipeline/list">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="text-2xl font-semibold h-auto py-1 max-w-md"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") {
                    setNameValue(opportunity.name);
                    setEditingName(false);
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleNameSave} disabled={saving}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNameValue(opportunity.name);
                  setEditingName(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl font-semibold cursor-pointer hover:text-orange-600"
                onClick={() => setEditingName(true)}
              >
                {opportunity.name}
              </h1>
              <button
                onClick={() => setEditingName(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={
                (statusColors[opportunity.status] as "secondary" | "default" | "destructive") ??
                "secondary"
              }
            >
              {opportunity.status}
            </Badge>
            <Badge
              variant={
                (priorityColors[opportunity.priority] as
                  | "outline"
                  | "secondary"
                  | "default"
                  | "destructive") ?? "secondary"
              }
            >
              {opportunity.priority}
            </Badge>
            <Badge variant="outline" style={{ borderLeft: `3px solid ${opportunity.stage.color}` }}>
              {opportunity.stage.name}
            </Badge>
            <span className="text-sm text-muted-foreground">{opportunity.pipeline.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Key Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(opportunity.value, opportunity.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium w-4 text-center">$</span>
              <div>
                <p className="text-xs text-muted-foreground">Currency</p>
                <p>{opportunity.currency}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Probability</p>
                <p>{opportunity.probability != null ? `${opportunity.probability}%` : "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Expected Close</p>
                <p>
                  {opportunity.expectedCloseDate
                    ? formatDate(opportunity.expectedCloseDate)
                    : "Not set"}
                </p>
              </div>
            </div>

            {opportunity.actualCloseDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Actual Close</p>
                  <p>{formatDate(opportunity.actualCloseDate)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p>{opportunity.source ?? "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Owner</p>
                <p>{opportunity.owner.user.name ?? opportunity.owner.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Account</p>
                {opportunity.account ? (
                  <Link
                    href={`/accounts/${opportunity.account.id}`}
                    className="text-orange-600 hover:underline"
                  >
                    {opportunity.account.name}
                  </Link>
                ) : (
                  <p className="text-muted-foreground">No account</p>
                )}
              </div>
            </div>

            {opportunity.lostReason && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-1">Lost Reason</p>
                <p className="text-sm">{opportunity.lostReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contacts">
                Contacts ({opportunity.contacts.length})
              </TabsTrigger>
              <TabsTrigger value="products">
                Products ({opportunity.products.length})
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity ({opportunity.activities.length})
              </TabsTrigger>
              <TabsTrigger value="history">Stage History</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Description</CardTitle>
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Opportunity</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Value</label>
                            <Input
                              type="number"
                              value={editForm.value}
                              onChange={(e) =>
                                setEditForm({ ...editForm, value: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Currency</label>
                            <Input
                              value={editForm.currency}
                              onChange={(e) =>
                                setEditForm({ ...editForm, currency: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Probability (%)</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={editForm.probability}
                              onChange={(e) =>
                                setEditForm({ ...editForm, probability: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Select
                              value={editForm.priority}
                              onValueChange={(val) =>
                                setEditForm({ ...editForm, priority: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Expected Close Date</label>
                          <Input
                            type="date"
                            value={editForm.expectedCloseDate}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                expectedCloseDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Source</label>
                          <Input
                            value={editForm.source}
                            onChange={(e) =>
                              setEditForm({ ...editForm, source: e.target.value })
                            }
                            placeholder="e.g. Referral, Website, Cold Call"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Account ID</label>
                          <Input
                            value={editForm.accountId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, accountId: e.target.value })
                            }
                            placeholder="Account ID"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            rows={4}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Lost Reason</label>
                          <Input
                            value={editForm.lostReason}
                            onChange={(e) =>
                              setEditForm({ ...editForm, lostReason: e.target.value })
                            }
                            placeholder="Only applicable for lost deals"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleEditSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {opportunity.description ? (
                    <p className="text-sm whitespace-pre-wrap">{opportunity.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No description. Click Edit to add one.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts">
              <div className="space-y-2">
                {opportunity.contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No contacts linked to this opportunity.
                  </p>
                ) : (
                  opportunity.contacts.map(({ contact, role }) => (
                    <Card key={contact.id}>
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="font-medium text-sm hover:underline text-orange-600"
                          >
                            {contact.firstName} {contact.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {contact.jobTitle ?? ""}
                            {contact.email ? ` \u00B7 ${contact.email}` : ""}
                          </p>
                        </div>
                        {role && (
                          <Badge variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="space-y-2">
                {opportunity.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No products linked to this opportunity.
                  </p>
                ) : (
                  opportunity.products.map(({ product, quantity, notes }) => (
                    <Card key={product.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.sku ? `SKU: ${product.sku}` : ""}
                              {product.category
                                ? `${product.sku ? " \u00B7 " : ""}${product.category}`
                                : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Qty: {quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Unit:{" "}
                              {formatCurrency(product.unitPrice, product.currency)}
                            </p>
                          </div>
                        </div>
                        {notes && (
                          <p className="text-xs text-muted-foreground mt-2">{notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="space-y-2">
                {opportunity.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No activity yet.</p>
                ) : (
                  opportunity.activities.map((act) => (
                    <Card key={act.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <span>{activityIcons[act.type] ?? "\u{1F4CC}"}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{act.title}</p>
                            {act.body && (
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                {act.body}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {act.createdBy.user.name} &middot;{" "}
                              {formatDateTime(act.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Stage History Tab */}
            <TabsContent value="history">
              <div className="space-y-2">
                {opportunity.stageHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No stage transitions recorded.
                  </p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-4">
                      {opportunity.stageHistory.map((entry, index) => (
                        <div key={entry.id} className="relative flex items-start gap-4 pl-2">
                          <div
                            className="w-5 h-5 rounded-full border-2 shrink-0 z-10"
                            style={{
                              borderColor: entry.toStage.color,
                              backgroundColor:
                                index === 0 ? entry.toStage.color : "white",
                            }}
                          />
                          <div className="flex-1 pb-2">
                            <p className="font-medium text-sm">
                              Moved to{" "}
                              <span style={{ color: entry.toStage.color }}>
                                {entry.toStage.name}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(entry.movedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

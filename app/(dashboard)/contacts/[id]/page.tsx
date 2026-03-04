"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mail, Phone, Briefcase, Building2, Pencil } from "lucide-react";
import Link from "next/link";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  status: string;
  leadSource: string | null;
  notes: string | null;
  account: { id: string; name: string } | null;
  opportunities: Array<{
    opportunity: {
      id: string;
      name: string;
      value: string;
      currency: string;
      status: string;
      stage: { name: string; color: string };
      owner: { user: { name: string | null } };
    };
  }>;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    createdAt: string;
    createdBy: { user: { name: string | null } };
  }>;
}

interface AccountOption {
  id: string;
  name: string;
}

const activityIcons: Record<string, string> = {
  NOTE: "\u{1F4DD}", CALL: "\u{1F4DE}", EMAIL: "\u2709\uFE0F", MEETING: "\u{1F91D}", TASK: "\u2705",
  DEMO: "\u{1F5A5}\uFE0F", PROPOSAL_SENT: "\u{1F4C4}", CONTRACT_SENT: "\u{1F4CB}",
  STAGE_CHANGE: "\u2195\uFE0F", SYSTEM: "\u2699\uFE0F",
};

const CONTACT_STATUSES = ["ACTIVE", "INACTIVE", "LEAD", "CUSTOMER", "CHURNED"] as const;

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickLog, setQuickLog] = useState({ type: "NOTE", title: "", body: "", dueAt: "" });

  // Edit dialog state
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    notes: "",
    status: "ACTIVE",
    leadSource: "",
    accountId: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/workspace/contacts/${id}`);
    const data = await res.json();
    setContact(data.contact ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEditDialog = async () => {
    if (!contact) return;
    setEditForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      jobTitle: contact.jobTitle ?? "",
      department: contact.department ?? "",
      notes: contact.notes ?? "",
      status: contact.status,
      leadSource: contact.leadSource ?? "",
      accountId: contact.account?.id ?? "",
    });
    // Load accounts for the dropdown
    try {
      const res = await fetch("/api/workspace/accounts");
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    } catch {
      setAccounts([]);
    }
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = { ...editForm };
      // Send null for empty optional strings
      if (!payload.email) payload.email = null;
      if (!payload.phone) payload.phone = null;
      if (!payload.jobTitle) payload.jobTitle = null;
      if (!payload.department) payload.department = null;
      if (!payload.notes) payload.notes = null;
      if (!payload.leadSource) payload.leadSource = null;
      if (!payload.accountId) payload.accountId = null;

      const res = await fetch(`/api/workspace/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowEdit(false);
        loadData();
      }
    } finally {
      setEditSaving(false);
    }
  };

  const handleQuickLog = async () => {
    if (!quickLog.title) return;
    const payload: Record<string, unknown> = {
      type: quickLog.type,
      title: quickLog.title,
      body: quickLog.body || undefined,
      contactId: id,
    };
    if (quickLog.type === "TASK" && quickLog.dueAt) {
      payload.dueAt = new Date(quickLog.dueAt).toISOString();
    }
    await fetch("/api/workspace/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setQuickLog({ type: "NOTE", title: "", body: "", dueAt: "" });
    loadData();
  };

  if (loading) return <div className="p-6 animate-pulse"><div className="h-8 w-48 bg-gray-200 rounded" /></div>;
  if (!contact) return <div className="p-6"><p>Contact not found.</p></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/contacts">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{contact.firstName} {contact.lastName}</h1>
            <Button variant="ghost" size="icon" onClick={openEditDialog}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{contact.jobTitle ?? ""} {contact.account ? `at ${contact.account.name}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-orange-600 hover:underline">{contact.email}</a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.department && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{contact.department}</span>
              </div>
            )}
            {contact.account && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Link href={`/accounts/${contact.account.id}`} className="text-orange-600 hover:underline">
                  {contact.account.name}
                </Link>
              </div>
            )}
            <div className="pt-2">
              <Badge variant="secondary">{contact.status}</Badge>
              {contact.leadSource && <Badge variant="outline" className="ml-2">{contact.leadSource}</Badge>}
            </div>
            {contact.notes && (
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities ({contact.opportunities.length})</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              {/* Quick Log Bar */}
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex gap-2 mb-2">
                    {["NOTE", "CALL", "EMAIL", "MEETING", "TASK"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuickLog({ ...quickLog, type: t })}
                        className={`px-2 py-1 text-xs rounded-md border ${quickLog.type === t ? "bg-orange-50 border-orange-200 text-orange-700" : "hover:bg-gray-50"}`}
                      >
                        {activityIcons[t]} {t}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={quickLog.title}
                    onChange={(e) => setQuickLog({ ...quickLog, title: e.target.value })}
                    placeholder="Activity title..."
                    className="mb-2"
                  />
                  {quickLog.type === "TASK" && (
                    <div className="mb-2">
                      <Label className="text-xs text-muted-foreground">Due Date</Label>
                      <Input
                        type="datetime-local"
                        value={quickLog.dueAt}
                        onChange={(e) => setQuickLog({ ...quickLog, dueAt: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      value={quickLog.body}
                      onChange={(e) => setQuickLog({ ...quickLog, body: e.target.value })}
                      placeholder="Details (optional, supports Markdown)"
                      className="flex-1"
                      rows={2}
                    />
                    <Button onClick={handleQuickLog} className="self-end">Log</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {contact.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet. Use the quick log bar above.</p>
                ) : (
                  contact.activities.map((act) => (
                    <Card key={act.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <span>{activityIcons[act.type] ?? "\u{1F4CC}"}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{act.title}</p>
                            {act.body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{act.body}</p>}
                            <p className="text-xs text-muted-foreground mt-1">
                              {act.createdBy.user.name} &middot; {new Date(act.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="opportunities">
              <div className="space-y-3">
                {contact.opportunities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No linked opportunities.</p>
                ) : (
                  contact.opportunities.map(({ opportunity: opp }) => (
                    <Card key={opp.id}>
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                          <Link href={`/pipeline/${opp.id}`} className="font-medium text-sm hover:underline text-orange-600">{opp.name}</Link>
                          <p className="text-xs text-muted-foreground">{opp.owner.user.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: opp.currency, minimumFractionDigits: 0 }).format(Number(opp.value))}
                          </p>
                          <Badge variant="secondary" style={{ borderLeft: `3px solid ${opp.stage.color}` }}>
                            {opp.stage.name}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="tags">
              <div className="py-8 text-center text-sm text-muted-foreground">
                Tags coming soon
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={editForm.jobTitle}
                  onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(val) => setEditForm({ ...editForm, status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lead Source</Label>
              <Input
                value={editForm.leadSource}
                onChange={(e) => setEditForm({ ...editForm, leadSource: e.target.value })}
              />
            </div>
            <div>
              <Label>Account</Label>
              <Select
                value={editForm.accountId || "none"}
                onValueChange={(val) => setEditForm({ ...editForm, accountId: val === "none" ? "" : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No account</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

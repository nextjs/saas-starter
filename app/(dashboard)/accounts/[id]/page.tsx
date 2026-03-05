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
import { ArrowLeft, Globe, MapPin, Building2, Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { TagManager } from "@/components/tags/TagManager";

interface AccountDetail {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  annualRevenue: number | null;
  description: string | null;
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    jobTitle: string | null;
    status: string;
  }>;
  opportunities: Array<{
    id: string;
    name: string;
    value: string;
    currency: string;
    status: string;
    stage: { name: string; color: string };
    owner: { user: { name: string | null } };
  }>;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
    createdBy: { user: { name: string | null } };
  }>;
  tags: Array<{ tag: { id: string; name: string; color: string } }>;
}

const activityIcons: Record<string, string> = {
  NOTE: "\u{1F4DD}", CALL: "\u{1F4DE}", EMAIL: "\u2709\uFE0F", MEETING: "\u{1F91D}", TASK: "\u2705",
  DEMO: "\u{1F5A5}\uFE0F", PROPOSAL_SENT: "\u{1F4C4}", CONTRACT_SENT: "\u{1F4CB}",
  STAGE_CHANGE: "\u2195\uFE0F", SYSTEM: "\u2699\uFE0F",
};

const ACCOUNT_SIZES = ["MICRO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"] as const;

interface ContactOption { id: string; firstName: string; lastName: string; email: string | null }

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Link contact state
  const [showLinkContact, setShowLinkContact] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<ContactOption[]>([]);
  const [linkContactId, setLinkContactId] = useState("");

  // Edit dialog state
  const [showEdit, setShowEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    domain: "",
    industry: "",
    size: "",
    website: "",
    phone: "",
    city: "",
    country: "",
    annualRevenue: "",
    description: "",
  });

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/workspace/accounts/${id}`);
    const data = await res.json();
    setAccount(data.account ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEditDialog = () => {
    if (!account) return;
    setEditForm({
      name: account.name,
      domain: account.domain ?? "",
      industry: account.industry ?? "",
      size: account.size ?? "",
      website: account.website ?? "",
      phone: account.phone ?? "",
      city: account.city ?? "",
      country: account.country ?? "",
      annualRevenue: account.annualRevenue != null ? String(account.annualRevenue) : "",
      description: account.description ?? "",
    });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name,
        domain: editForm.domain || null,
        industry: editForm.industry || null,
        size: editForm.size || null,
        website: editForm.website || null,
        phone: editForm.phone || null,
        city: editForm.city || null,
        country: editForm.country || null,
        annualRevenue: editForm.annualRevenue ? Number(editForm.annualRevenue) : null,
        description: editForm.description || null,
      };

      const res = await fetch(`/api/workspace/accounts/${id}`, {
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

  const openLinkContact = async () => {
    try {
      const res = await fetch("/api/workspace/contacts");
      const data = await res.json();
      // Show contacts NOT already on this account
      const accountContactIds = new Set(account?.contacts.map((c) => c.id) ?? []);
      setAvailableContacts((data.contacts ?? []).filter((c: ContactOption) => !accountContactIds.has(c.id)));
    } catch { setAvailableContacts([]); }
    setLinkContactId("");
    setShowLinkContact(true);
  };

  const handleLinkContact = async () => {
    if (!linkContactId) return;
    await fetch(`/api/workspace/contacts/${linkContactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: id }),
    });
    setShowLinkContact(false);
    loadData();
  };

  const handleUnlinkContact = async (contactId: string) => {
    await fetch(`/api/workspace/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: null }),
    });
    loadData();
  };

  if (loading) return <div className="p-6 animate-pulse"><div className="h-8 w-48 bg-gray-200 rounded" /></div>;
  if (!account) return <div className="p-6"><p>Account not found.</p></div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accounts">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{account.name}</h1>
            <Button variant="ghost" size="icon" onClick={openEditDialog}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {[account.industry, account.city, account.country].filter(Boolean).join(" \u00B7 ")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {account.domain && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{account.domain}</span>
              </div>
            )}
            {(account.city || account.country) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{[account.city, account.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {account.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{account.industry}</span>
              </div>
            )}
            {account.size && <Badge variant="secondary">{account.size}</Badge>}
            {account.annualRevenue && (
              <p className="text-muted-foreground">
                Annual Revenue: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(account.annualRevenue)}
              </p>
            )}
            {account.description && (
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="whitespace-pre-wrap">{account.description}</p>
              </div>
            )}
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
              <TagManager
                entityId={id}
                entityType="CRM_ACCOUNT"
                assignedTags={account.tags ?? []}
                onUpdate={loadData}
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="contacts">
            <TabsList>
              <TabsTrigger value="contacts">Contacts ({account.contacts.length})</TabsTrigger>
              <TabsTrigger value="opportunities">Deals ({account.opportunities.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity ({account.activities.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts">
              <div className="space-y-2">
                <div className="flex justify-end mb-2">
                  <Button variant="outline" size="sm" onClick={openLinkContact}>
                    <Plus className="h-4 w-4 mr-1" /> Link Contact
                  </Button>
                </div>
                {account.contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No contacts linked. Click &ldquo;Link Contact&rdquo; to add one.</p>
                ) : (
                  account.contacts.map((c) => (
                    <Card key={c.id}>
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                          <Link href={`/contacts/${c.id}`} className="font-medium text-sm hover:underline text-orange-600">
                            {c.firstName} {c.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{c.jobTitle ?? ""} {c.email ? `\u00B7 ${c.email}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUnlinkContact(c.id)} title="Unlink contact">
                            <X className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="opportunities">
              <div className="space-y-2">
                {account.opportunities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No deals linked to this account.</p>
                ) : (
                  account.opportunities.map((opp) => (
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
                          <Badge variant={opp.status === "WON" ? "default" : opp.status === "LOST" ? "destructive" : "secondary"} className="text-xs">
                            {opp.stage.name}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="space-y-2">
                {account.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No activity for this account.</p>
                ) : (
                  account.activities.map((act) => (
                    <Card key={act.id}>
                      <CardContent className="pt-4 flex items-start gap-2">
                        <span>{activityIcons[act.type] ?? "\u{1F4CC}"}</span>
                        <div>
                          <p className="font-medium text-sm">{act.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {act.createdBy.user.name} &middot; {new Date(act.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Account Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Domain</Label>
                <Input
                  value={editForm.domain}
                  onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                  placeholder="example.com"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Input
                  value={editForm.industry}
                  onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Size</Label>
              <Select
                value={editForm.size || "none"}
                onValueChange={(val) => setEditForm({ ...editForm, size: val === "none" ? "" : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {ACCOUNT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                placeholder="https://example.com"
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
                <Label>City</Label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Annual Revenue</Label>
              <Input
                type="number"
                value={editForm.annualRevenue}
                onChange={(e) => setEditForm({ ...editForm, annualRevenue: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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

      {/* Link Contact Dialog */}
      <Dialog open={showLinkContact} onOpenChange={setShowLinkContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Contact to Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Contact</Label>
              <Select value={linkContactId} onValueChange={setLinkContactId}>
                <SelectTrigger><SelectValue placeholder="Select a contact" /></SelectTrigger>
                <SelectContent>
                  {availableContacts.length === 0 ? (
                    <SelectItem value="__empty">No unlinked contacts available</SelectItem>
                  ) : (
                    availableContacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}{c.email ? ` (${c.email})` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkContact(false)}>Cancel</Button>
            <Button onClick={handleLinkContact} disabled={!linkContactId}>Link Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

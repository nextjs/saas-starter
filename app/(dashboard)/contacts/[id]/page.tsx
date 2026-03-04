"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, Briefcase, Building2 } from "lucide-react";
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

const activityIcons: Record<string, string> = {
  NOTE: "📝", CALL: "📞", EMAIL: "✉️", MEETING: "🤝", TASK: "✅",
  DEMO: "🖥️", PROPOSAL_SENT: "📄", CONTRACT_SENT: "📋",
  STAGE_CHANGE: "↕️", SYSTEM: "⚙️",
};

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickLog, setQuickLog] = useState({ type: "NOTE", title: "", body: "" });

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/workspace/contacts/${id}`);
    const data = await res.json();
    setContact(data.contact ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickLog = async () => {
    if (!quickLog.title) return;
    await fetch("/api/workspace/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...quickLog, contactId: id }),
    });
    setQuickLog({ type: "NOTE", title: "", body: "" });
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
        <div>
          <h1 className="text-2xl font-semibold">{contact.firstName} {contact.lastName}</h1>
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
                          <span>{activityIcons[act.type] ?? "📌"}</span>
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
                          <p className="font-medium text-sm">{opp.name}</p>
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}

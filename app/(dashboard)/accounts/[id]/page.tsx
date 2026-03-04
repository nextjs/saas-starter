"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Globe, MapPin, Building2, Users } from "lucide-react";
import Link from "next/link";

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
}

const activityIcons: Record<string, string> = {
  NOTE: "📝", CALL: "📞", EMAIL: "✉️", MEETING: "🤝", TASK: "✅",
  DEMO: "🖥️", PROPOSAL_SENT: "📄", CONTRACT_SENT: "📋",
  STAGE_CHANGE: "↕️", SYSTEM: "⚙️",
};

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/workspace/accounts/${id}`);
    const data = await res.json();
    setAccount(data.account ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="p-6 animate-pulse"><div className="h-8 w-48 bg-gray-200 rounded" /></div>;
  if (!account) return <div className="p-6"><p>Account not found.</p></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/accounts">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{account.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[account.industry, account.city, account.country].filter(Boolean).join(" · ")}
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
                {account.contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No contacts linked to this account.</p>
                ) : (
                  account.contacts.map((c) => (
                    <Card key={c.id}>
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div>
                          <Link href={`/contacts/${c.id}`} className="font-medium text-sm hover:underline">
                            {c.firstName} {c.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{c.jobTitle ?? ""} {c.email ? `· ${c.email}` : ""}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{c.status}</Badge>
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
                          <p className="font-medium text-sm">{opp.name}</p>
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
                        <span>{activityIcons[act.type] ?? "📌"}</span>
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
    </div>
  );
}

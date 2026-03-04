"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Plus } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Opportunity {
  id: string;
  name: string;
  value: string;
  currency: string;
  probability: number | null;
  status: string;
  expectedCloseDate: string | null;
  createdAt: string;
  stage: { name: string; color: string };
  pipeline: { id: string; name: string };
  account: { id: string; name: string } | null;
  owner: { user: { name: string | null } };
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

type SortKey = "name" | "value" | "stage" | "createdAt" | "expectedCloseDate";

export default function PipelineListPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showCreate, setShowCreate] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: "", value: "" });

  const loadData = useCallback(async () => {
    const res = await fetch("/api/workspace/opportunities");
    const data = await res.json();
    setOpportunities(data.opportunities ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = opportunities
    .filter((o) =>
      search
        ? o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.account?.name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "value":
          return (Number(a.value) - Number(b.value)) * dir;
        case "stage":
          return a.stage.name.localeCompare(b.stage.name) * dir;
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        case "expectedCloseDate":
          return (
            (new Date(a.expectedCloseDate ?? 0).getTime() -
              new Date(b.expectedCloseDate ?? 0).getTime()) * dir
          );
        default:
          return 0;
      }
    });

  const handleCreateDeal = async () => {
    if (!newDeal.name) return;
    const stagesRes = await fetch("/api/workspace/pipeline/stages");
    const stagesData = await stagesRes.json();
    const firstStage = stagesData.stages?.[0];
    if (!firstStage) return;

    await fetch("/api/workspace/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newDeal.name,
        value: Number(newDeal.value) || 0,
        pipelineId: firstStage.pipeline.id,
        stageId: firstStage.id,
      }),
    });

    setShowCreate(false);
    setNewDeal({ name: "", value: "" });
    loadData();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Deal
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button className="flex items-center gap-1" onClick={() => handleSort("name")}>
                  Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Account</TableHead>
              <TableHead>
                <button className="flex items-center gap-1" onClick={() => handleSort("stage")}>
                  Stage <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1" onClick={() => handleSort("value")}>
                  Value <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>
                <button className="flex items-center gap-1" onClick={() => handleSort("expectedCloseDate")}>
                  Close Date <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No opportunities found.{" "}
                  <button onClick={() => setShowCreate(true)} className="text-orange-600 hover:underline">
                    Create one
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">{opp.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {opp.account ? (
                      <Link href={`/accounts/${opp.account.id}`} className="hover:underline">
                        {opp.account.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ borderLeft: `3px solid ${opp.stage.color}` }}
                    >
                      {opp.stage.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(opp.value), opp.currency)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{opp.owner.user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {opp.expectedCloseDate
                      ? new Date(opp.expectedCloseDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        opp.status === "WON"
                          ? "default"
                          : opp.status === "LOST"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {opp.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
          </DialogHeader>
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
    </div>
  );
}

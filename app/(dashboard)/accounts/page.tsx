"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

interface CrmAccount {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  city: string | null;
  country: string | null;
  _count: { contacts: number; opportunities: number; activities: number };
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", industry: "", city: "", country: "" });

  const [pageError, setPageError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/workspace/accounts${params}`);
      if (!res.ok) {
        const data = await res.json();
        setPageError(typeof data.error === "string" ? data.error : `API error (${res.status})`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAccounts(data.accounts ?? []);
      setPageError(null);
    } catch {
      setPageError("Failed to load accounts — check your connection");
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.name) return;
    setError(null);
    try {
      const res = await fetch("/api/workspace/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          domain: form.domain || null,
          industry: form.industry || null,
          city: form.city || null,
          country: form.country || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to create account");
        return;
      }
      setShowCreate(false);
      setForm({ name: "", domain: "", industry: "", city: "", country: "" });
      loadData();
    } catch {
      setError("Network error — please try again");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button className="shrink-0" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Account
          </Button>
        </div>
      </div>

      {pageError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
          <p className="text-sm font-medium text-red-800">{pageError}</p>
          {pageError.includes("Workspace") && (
            <p className="text-sm text-red-600 mt-1">Visit <code className="bg-red-100 px-1 rounded">/api/setup/seed</code> to initialize the database, then refresh this page.</p>
          )}
        </div>
      )}

      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Deals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No accounts found.{" "}
                  <button onClick={() => setShowCreate(true)} className="text-orange-600 hover:underline">Add one</button>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/accounts/${a.id}`} className="font-medium hover:underline">
                      {a.name}
                    </Link>
                    {a.domain && <span className="text-xs text-muted-foreground ml-2">{a.domain}</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.industry ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[a.city, a.country].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a._count.contacts}</TableCell>
                  <TableCell className="text-muted-foreground">{a._count.opportunities}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
          </DialogHeader>
          {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Domain</label>
              <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="example.com" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

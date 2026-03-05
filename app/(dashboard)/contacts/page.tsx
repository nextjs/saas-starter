"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Camera } from "lucide-react";
import Link from "next/link";
import { BusinessCardScanner } from "@/components/contacts/BusinessCardScanner";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  status: string;
  account: { id: string; name: string } | null;
  _count: { opportunities: number; activities: number };
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  LEAD: "bg-blue-100 text-blue-800",
  CUSTOMER: "bg-purple-100 text-purple-800",
  CHURNED: "bg-red-100 text-red-800",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", jobTitle: "" });

  const [pageError, setPageError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/workspace/contacts${params}`);
      if (!res.ok) {
        const data = await res.json();
        setPageError(typeof data.error === "string" ? data.error : `API error (${res.status})`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setContacts(data.contacts ?? []);
      setPageError(null);
    } catch {
      setPageError("Failed to load contacts — check your connection");
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName) return;
    setError(null);
    try {
      const res = await fetch("/api/workspace/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || null,
          jobTitle: form.jobTitle || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.fieldErrors ? "Validation error — check required fields" : (typeof data.error === "string" ? data.error : "Failed to create contact"));
        return;
      }
      setShowCreate(false);
      setForm({ firstName: "", lastName: "", email: "", jobTitle: "" });
      loadData();
    } catch {
      setError("Network error — please try again");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => setShowScanner(true)}>
            <Camera className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Scan Card</span>
          </Button>
          <Button className="shrink-0" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Contact
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
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No contacts found.{" "}
                  <button onClick={() => setShowCreate(true)} className="text-orange-600 hover:underline">
                    Add one
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                      {c.firstName} {c.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.jobTitle ?? "—"}</TableCell>
                  <TableCell>
                    {c.account ? (
                      <Link href={`/accounts/${c.account.id}`} className="text-muted-foreground hover:underline">
                        {c.account.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[c.status] ?? ""}`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c._count.opportunities}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Job Title</label>
              <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BusinessCardScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onCreated={loadData}
      />

      {/* Mobile FAB for quick card scan */}
      <button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-6 right-6 z-30 sm:hidden w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 active:bg-orange-700 flex items-center justify-center"
        aria-label="Scan business card"
      >
        <Camera className="h-6 w-6" />
      </button>
    </div>
  );
}

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
import { Plus, Pencil, RefreshCw } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unitPrice: string;
  currency: string;
  isActive: boolean;
  source: string;
  xeroItemCode: string | null;
  lastSyncedAt: string | null;
  _count: { opportunities: number };
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(value);
}

export default function ProductsSettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "", unitPrice: "", currency: "USD" });
  const [editForm, setEditForm] = useState({ id: "", name: "", sku: "", category: "", unitPrice: "", currency: "USD", isActive: true, source: "local" });
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/workspace/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSyncXero = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/workspace/products/sync-xero", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(data.message);
        loadData();
      } else {
        setSyncMessage(data.error ?? "Sync failed");
      }
    } catch {
      setSyncMessage("Network error — please try again");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setError(null);
    try {
      const res = await fetch("/api/workspace/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || null,
          category: form.category || null,
          unitPrice: Number(form.unitPrice) || 0,
          currency: form.currency,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to create product");
        return;
      }
      setShowCreate(false);
      setForm({ name: "", sku: "", category: "", unitPrice: "", currency: "USD" });
      loadData();
    } catch {
      setError("Network error — please try again");
    }
  };

  const openEdit = (p: Product) => {
    setEditForm({
      id: p.id,
      name: p.name,
      sku: p.sku ?? "",
      category: p.category ?? "",
      unitPrice: String(Number(p.unitPrice)),
      currency: p.currency,
      isActive: p.isActive,
      source: p.source,
    });
    setEditError(null);
    setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!editForm.name) return;
    setEditError(null);
    try {
      const res = await fetch("/api/workspace/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editForm.id,
          name: editForm.name,
          sku: editForm.sku || null,
          category: editForm.category || null,
          unitPrice: Number(editForm.unitPrice) || 0,
          currency: editForm.currency,
          isActive: editForm.isActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(typeof data.error === "string" ? data.error : "Failed to update product");
        return;
      }
      setShowEdit(false);
      loadData();
    } catch {
      setEditError("Network error — please try again");
    }
  };

  const toggleActive = async (p: Product) => {
    await fetch("/api/workspace/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    loadData();
  };

  const isXero = editForm.source === "xero";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSyncXero} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Xero"}
          </Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Add Custom Product</Button>
        </div>
      </div>

      {syncMessage && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          {syncMessage}
        </div>
      )}

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU / Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Used In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products. Sync from Xero or add a custom product to get started.</TableCell></TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{p.xeroItemCode ?? p.sku ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(Number(p.unitPrice), p.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={p.source === "xero" ? "outline" : "secondary"} className="text-xs">
                      {p.source === "xero" ? "Xero" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => toggleActive(p)}
                      title={p.isActive ? "Click to deactivate" : "Click to activate"}
                    >
                      <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs cursor-pointer">
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{p._count.opportunities} deals</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(p)}
                      title={p.source === "xero" ? "Edit local settings" : "Edit product"}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setError(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Custom Product</DialogTitle></DialogHeader>
          {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Price</label>
                <Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={(open) => { setShowEdit(open); if (!open) setEditError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isXero ? "Edit Xero Product (Local Settings)" : "Edit Product"}
            </DialogTitle>
          </DialogHeader>
          {isXero && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
              Name, SKU, and price are synced from Xero. You can change the category and active status locally.
            </div>
          )}
          {editError && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{editError}</div>}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} disabled={isXero} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input value={editForm.sku} onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })} placeholder="Optional" disabled={isXero} />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Price</label>
                <Input type="number" value={editForm.unitPrice} onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })} placeholder="0" disabled={isXero} />
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Input value={editForm.currency} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} disabled={isXero} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active-toggle"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="edit-active-toggle" className="text-sm font-medium">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Plus, Pencil } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unitPrice: string;
  currency: string;
  isActive: boolean;
  _count: { opportunities: number };
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(value);
}

export default function ProductsSettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "", unitPrice: "", currency: "USD" });
  const [editForm, setEditForm] = useState({ id: "", name: "", sku: "", category: "", unitPrice: "", currency: "USD", isActive: true });
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Used In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products. Add one to get started.</TableCell></TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{p.sku ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(Number(p.unitPrice), p.currency)}</TableCell>
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
                      title="Edit product"
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
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
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
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          {editError && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{editError}</div>}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input value={editForm.sku} onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Price</label>
                <Input type="number" value={editForm.unitPrice} onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Input value={editForm.currency} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} />
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

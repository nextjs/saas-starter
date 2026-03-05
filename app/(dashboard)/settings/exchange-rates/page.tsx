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
import { Plus, Trash2 } from "lucide-react";

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  effectiveDate: string;
}

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fromCurrency: "",
    toCurrency: "",
    rate: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    const res = await fetch("/api/workspace/settings/exchange-rates");
    const data = await res.json();
    setRates(data.rates ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!form.fromCurrency || !form.toCurrency || !form.rate) return;
    setError(null);
    try {
      const res = await fetch("/api/workspace/settings/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCurrency: form.fromCurrency.toUpperCase(),
          toCurrency: form.toCurrency.toUpperCase(),
          rate: Number(form.rate),
          effectiveDate: form.effectiveDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to create rate");
        return;
      }
      setShowCreate(false);
      setForm({
        fromCurrency: "",
        toCurrency: "",
        rate: "",
        effectiveDate: new Date().toISOString().split("T")[0],
      });
      loadData();
    } catch {
      setError("Network error — please try again");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exchange rate?")) return;
    const res = await fetch(`/api/workspace/settings/exchange-rates?rateId=${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadData();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Exchange Rates</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Rate
        </Button>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No exchange rates configured. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              rates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono font-medium">{r.fromCurrency}</TableCell>
                  <TableCell className="font-mono font-medium">{r.toCurrency}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {Number(r.rate).toFixed(4)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(r.effectiveDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(r.id)}
                      title="Delete rate"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exchange Rate</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">From Currency</label>
                <Input
                  value={form.fromCurrency}
                  onChange={(e) => setForm({ ...form, fromCurrency: e.target.value })}
                  placeholder="USD"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium">To Currency</label>
                <Input
                  value={form.toCurrency}
                  onChange={(e) => setForm({ ...form, toCurrency: e.target.value })}
                  placeholder="EUR"
                  className="font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Rate</label>
              <Input
                type="number"
                step="0.0001"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                placeholder="1.0000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Effective Date</label>
              <Input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

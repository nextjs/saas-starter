"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, TrendingUp } from "lucide-react";

interface ProductRow {
  productId: string;
  productName: string;
  category: string | null;
  sku: string | null;
  dealCount: number;
  totalValue: number;
  avgDealSize: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function defaultStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

function defaultEndDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ProductMixReportPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  function fetchData(start: string, end: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set("startDate", start);
    if (end) params.set("endDate", end);
    fetch(`/api/workspace/reports/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        const sorted = (d.products ?? []).sort(
          (a: ProductRow, b: ProductRow) => b.totalValue - a.totalValue
        );
        setProducts(sorted);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApplyFilter() {
    fetchData(startDate, endDate);
  }

  const totalDealValue = products.reduce((s, p) => s + p.totalValue, 0);
  const totalProductsUsed = products.length;
  const mostPopular =
    products.length > 0
      ? products.reduce((best, p) =>
          p.dealCount > best.dealCount ? p : best
        )
      : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Product Mix Report</h1>

      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={handleApplyFilter}>Apply</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Products Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalProductsUsed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalDealValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Most Popular Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mostPopular ? mostPopular.productName : "—"}
            </p>
            {mostPopular && (
              <p className="text-sm text-muted-foreground">
                {mostPopular.dealCount} deal{mostPopular.dealCount !== 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-100 rounded" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">
              No product data for the selected period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Deal Count</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Avg Deal Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell className="font-medium">{p.productName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.sku ?? "—"}
                    </TableCell>
                    <TableCell>
                      {p.category ? (
                        <Badge variant="secondary">{p.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{p.dealCount}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(p.totalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(p.avgDealSize)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

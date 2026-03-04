"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function ProductsSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Products</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" /> Product Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Full CRUD on product catalog. Activate/deactivate products. Coming in Phase 6.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

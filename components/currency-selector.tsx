"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_CURRENCIES = ["USD", "EUR", "GBP", "MYR", "SGD", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "NZD"];

/**
 * Currency selector dropdown that persists the user's preference.
 * Fetches current preference from /api/workspace/members/me/preferences on mount.
 */
export function CurrencySelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (currency: string) => void;
}) {
  return (
    <Select value={value ?? "USD"} onValueChange={onChange}>
      <SelectTrigger className="w-[90px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DEFAULT_CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Hook that loads and persists the user's display currency preference.
 */
export function useDisplayCurrency() {
  const [currency, setCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspace/members/me/preferences")
      .then((r) => r.json())
      .then((d) => {
        if (d.displayCurrency) setCurrency(d.displayCurrency);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setAndPersist = useCallback(
    (newCurrency: string) => {
      setCurrency(newCurrency);
      fetch("/api/workspace/members/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayCurrency: newCurrency }),
      }).catch(() => {});
    },
    []
  );

  return { currency, setCurrency: setAndPersist, loading };
}

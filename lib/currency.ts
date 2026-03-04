import { prisma } from "@/lib/prisma";

// Default currencies shown in dropdowns; workspaces can add more
export const DEFAULT_CURRENCIES = ["USD", "EUR", "GBP", "MYR", "SGD", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "NZD"] as const;

/**
 * Format a monetary value with the given currency code.
 */
export function formatCurrency(
  value: number | string,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

/**
 * Fetch latest exchange rates from the free exchangerate.host API (or frankfurter.dev fallback).
 * Caches in the CurrencyCache table for 4 hours.
 */
async function getPublicRates(baseCurrency: string): Promise<Record<string, number> | null> {
  // Check cache first (4 hour TTL)
  const cached = await prisma.currencyCache.findUnique({
    where: { baseCurrency },
  });

  if (cached && cached.fetchedAt > new Date(Date.now() - 4 * 60 * 60 * 1000)) {
    return cached.rates as Record<string, number>;
  }

  // Fetch from frankfurter.dev (free, no API key needed, ECB data)
  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`,
      { next: { revalidate: 14400 } } // 4 hours
    );
    if (!res.ok) throw new Error(`Rate API returned ${res.status}`);
    const data = await res.json();
    const rates: Record<string, number> = data.rates ?? {};

    // Upsert cache
    await prisma.currencyCache.upsert({
      where: { baseCurrency },
      update: { rates, fetchedAt: new Date() },
      create: { baseCurrency, rates, fetchedAt: new Date() },
    });

    return rates;
  } catch (err) {
    console.error("Failed to fetch exchange rates:", err);
    // Return stale cache if available
    if (cached) return cached.rates as Record<string, number>;
    return null;
  }
}

/**
 * Convert a monetary value from one currency to another.
 *
 * Priority:
 * 1. Workspace-specific exchange rate overrides
 * 2. Public API rates (frankfurter.dev — ECB data, cached 4h)
 * 3. Returns original value if no rate found
 */
export async function convertCurrency(
  workspaceId: string,
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  // 1. Try workspace override (direct)
  const rate = await prisma.exchangeRate.findUnique({
    where: {
      workspaceId_fromCurrency_toCurrency: {
        workspaceId,
        fromCurrency,
        toCurrency,
      },
    },
  });
  if (rate) return amount * Number(rate.rate);

  // Try workspace override (inverse)
  const inverse = await prisma.exchangeRate.findUnique({
    where: {
      workspaceId_fromCurrency_toCurrency: {
        workspaceId,
        fromCurrency: toCurrency,
        toCurrency: fromCurrency,
      },
    },
  });
  if (inverse) return amount / Number(inverse.rate);

  // 2. Try public API rates
  const publicRates = await getPublicRates(fromCurrency);
  if (publicRates && publicRates[toCurrency]) {
    return amount * publicRates[toCurrency];
  }

  // 3. Try via USD pivot (from → USD → to)
  if (fromCurrency !== "USD" && toCurrency !== "USD") {
    const fromRates = await getPublicRates("USD");
    if (fromRates && fromRates[fromCurrency] && fromRates[toCurrency]) {
      const amountInUsd = amount / fromRates[fromCurrency];
      return amountInUsd * fromRates[toCurrency];
    }
  }

  // No rate found — return original
  return amount;
}

/**
 * Bulk-convert multiple opportunity values to a target currency.
 * More efficient than calling convertCurrency in a loop.
 */
export async function bulkConvertToDisplay(
  workspaceId: string,
  items: Array<{ value: number; currency: string }>,
  targetCurrency: string
): Promise<number[]> {
  if (items.length === 0) return [];

  // Gather unique source currencies
  const sourceCurrencies = [...new Set(items.map((i) => i.currency))];

  // Pre-fetch all rates we need
  const rateMap: Record<string, number> = {};
  for (const src of sourceCurrencies) {
    if (src === targetCurrency) {
      rateMap[src] = 1;
      continue;
    }
    // This uses the full priority chain (workspace → public → pivot)
    const testAmount = await convertCurrency(workspaceId, 1, src, targetCurrency);
    rateMap[src] = testAmount; // rate for 1 unit
  }

  return items.map((item) => item.value * (rateMap[item.currency] ?? 1));
}

/**
 * Get the display currency for a workspace member.
 * Falls back to workspace reporting currency.
 */
export async function getDisplayCurrency(
  workspaceId: string,
  memberId: string
): Promise<string> {
  const member = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    select: { displayCurrency: true },
  });

  if (member?.displayCurrency) return member.displayCurrency;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { reportingCurrency: true },
  });

  return workspace?.reportingCurrency ?? "USD";
}

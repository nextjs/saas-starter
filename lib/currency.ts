import { prisma } from "@/lib/prisma";

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
 * Convert a monetary value from one currency to another using workspace exchange rates.
 * Falls back to returning the original value if no rate is found.
 */
export async function convertCurrency(
  workspaceId: string,
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  // Try direct rate
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

  // Try inverse
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

  // No rate found — return original
  return amount;
}

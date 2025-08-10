import type { SupportedCurrency } from "@/lib/exchange-rates";

export const DEFAULT_LOCALE = "es-PE" as const;

/**
 * Format a number as currency using Intl. Defaults to es-PE for PEN/USD.
 */
export function formatMoney(
  value: number,
  currency: SupportedCurrency,
  locale: string = DEFAULT_LOCALE
): string {
  if (!isFinite(value)) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback to simple formatting
    return `${
      currency === "USD" ? "$" : currency === "PEN" ? "S/" : currency + " "
    }${Number(value || 0).toLocaleString()}`;
  }
}

/**
 * Format a plain number with grouping.
 */
export function formatNumber(
  value: number,
  locale: string = DEFAULT_LOCALE
): string {
  if (!isFinite(value)) return "";
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return Number(value || 0).toLocaleString();
  }
}

/**
 * Format a date string or Date into a localized date.
 */
export function formatDate(
  input: string | Date,
  locale: string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch {
    return String(input);
  }
}

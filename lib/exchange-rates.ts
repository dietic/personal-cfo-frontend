// Exchange rate utilities with 24h caching, primary+fallback sources, and fixed fallback

export type SupportedCurrency = "PEN" | "USD";

export interface ExchangeRateInfo {
  usdPerPen: number; // 1 PEN -> USD
  penPerUsd: number; // 1 USD -> PEN
  source: "exchangerate-api" | "exchangerate.fun" | "fixed";
  fetchedAt: number; // epoch ms
  usingFixedFallback: boolean; // true only when both sources fail
}

const CACHE_KEY = "exchange_rate_pen_usd_v1";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_FIXED_PEN_PER_USD = 3.5;

function setCache(data: ExchangeRateInfo) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (_e) {
    // ignore
  }
}

function getCache(): ExchangeRateInfo | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as ExchangeRateInfo;
    if (!parsed || !parsed.fetchedAt) return undefined;
    if (Date.now() - parsed.fetchedAt > ONE_DAY_MS) return undefined;
    if (!isFinite(parsed.usdPerPen) || !isFinite(parsed.penPerUsd)) return undefined;
    return parsed;
  } catch (_e) {
    return undefined;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchPrimary(timeoutMs: number): Promise<ExchangeRateInfo | undefined> {
  // Safely access NEXT_PUBLIC env via globalThis to avoid TS node typings requirement
  const key = (globalThis as any)?.process?.env?.NEXT_PUBLIC_EXCHANGERATE_API_KEY as string | undefined;
  if (!key) return undefined; // skip if no key configured
  const url = `https://v6.exchangerate-api.com/v6/${key}/latest/PEN`;
  try {
    const res = await fetchWithTimeout(url, timeoutMs);
    if (!res.ok) return undefined;
    const data = await res.json();
    if (data?.result !== "success") return undefined;
    const usd = data?.conversion_rates?.USD;
    if (!usd || !isFinite(usd)) return undefined;
    const info: ExchangeRateInfo = {
      usdPerPen: Number(usd),
      penPerUsd: 1 / Number(usd),
      source: "exchangerate-api",
      fetchedAt: Date.now(),
      usingFixedFallback: false,
    };
    return info;
  } catch (_e) {
    return undefined;
  }
}

async function fetchFallback(timeoutMs: number): Promise<ExchangeRateInfo | undefined> {
  const url = `https://api.exchangerate.fun/latest?base=PEN`;
  try {
    const res = await fetchWithTimeout(url, timeoutMs);
    if (!res.ok) return undefined;
    const data = await res.json();
    // Prefer USD, fall back to BMD (some providers use BMD for USD peg)
    const usd = data?.rates?.USD ?? data?.rates?.BMD;
    if (!usd || !isFinite(usd)) return undefined;
    const info: ExchangeRateInfo = {
      usdPerPen: Number(usd),
      penPerUsd: 1 / Number(usd),
      source: "exchangerate.fun",
      fetchedAt: Date.now(),
      usingFixedFallback: false,
    };
    return info;
  } catch (_e) {
    return undefined;
  }
}

function fixedFallback(): ExchangeRateInfo {
  const penPerUsd = DEFAULT_FIXED_PEN_PER_USD;
  const usdPerPen = 1 / penPerUsd;
  return {
    usdPerPen,
    penPerUsd,
    source: "fixed",
    fetchedAt: Date.now(),
    usingFixedFallback: true,
  };
}

export async function getExchangeRate(timeoutMs: number = 4000): Promise<ExchangeRateInfo> {
  // 1) Cache
  const cached = getCache();
  if (cached) return cached;

  // 2) Primary source
  const primary = await fetchPrimary(timeoutMs);
  if (primary) {
    setCache(primary);
    return primary;
  }

  // 3) Fallback source
  const fallback = await fetchFallback(timeoutMs);
  if (fallback) {
    setCache(fallback);
    return fallback;
  }

  // 4) Fixed fallback
  const fixed = fixedFallback();
  // Still cache so we avoid repeated network calls until next day
  setCache(fixed);
  return fixed;
}

export function convertAmount(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rate: ExchangeRateInfo
): number {
  if (!isFinite(amount)) return 0;
  if (from === to) return amount;
  // From PEN to USD
  if (from === "PEN" && to === "USD") return amount * rate.usdPerPen;
  // From USD to PEN
  if (from === "USD" && to === "PEN") return amount * rate.penPerUsd;
  return amount;
}

export function getCurrencySymbol(code: SupportedCurrency): string {
  return code === "PEN" ? "S/" : "$";
}

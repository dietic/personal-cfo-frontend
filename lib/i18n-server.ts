import rawEn from "@/locales/en.json";
import rawEs from "@/locales/es.json";
import { cookies } from "next/headers";

export type ServerLocale = "es" | "en";

type Messages = Record<string, string>;

// Ensure compatibility whether JSON is exported as default or as a module object
const en = ((rawEn as any)?.default ?? (rawEn as any)) as Messages;
const es = ((rawEs as any)?.default ?? (rawEs as any)) as Messages;

const MESSAGES: Record<ServerLocale, Messages> = {
  es,
  en,
};

export function getServerLocale(): ServerLocale {
  try {
    // Prefer sync cookies() (Node runtime). In edge runtimes where cookies may be async,
    // this will throw and we'll fall back to default.
    const cookieStore: any = cookies() as any;
    const c = cookieStore?.get?.("locale")?.value as ServerLocale | undefined;
    if (c === "es" || c === "en") return c;
  } catch {}
  return "es";
}

function interpolate(
  template: string,
  params?: Record<string, string | number>
) {
  if (!params) return template;
  return template.replace(/\{(.*?)\}/g, (_m, k) => String(params[k] ?? ""));
}

export function tServer(
  key: string,
  params?: Record<string, string | number>
): string {
  const locale = getServerLocale();
  const current = MESSAGES[locale] ?? es;
  // Prefer current locale, then English, then the key itself
  const primary = (current as any)[key] as string | undefined;
  const fallback = (en as any)[key] as string | undefined;
  const str = primary ?? fallback ?? key;
  return interpolate(str, params);
}

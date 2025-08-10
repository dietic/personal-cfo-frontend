import rawEn from "@/locales/en.json";
import rawEs from "@/locales/es.json";
import { cookies } from "next/headers";

export type ServerLocale = "es" | "en";

type Messages = Record<string, string>;

const MESSAGES: Record<ServerLocale, Messages> = {
  es: rawEs as Messages,
  en: rawEn as Messages,
};

export function getServerLocale(): ServerLocale {
  try {
    const cookieStore = cookies();
    const c = cookieStore.get("locale")?.value as ServerLocale | undefined;
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
  const current = MESSAGES[locale] ?? (rawEs as Messages);
  const en = MESSAGES.en;
  // Prefer current locale, then English, then the key itself
  const primary = (current as any)[key] as string | undefined;
  const fallback = (en as any)[key] as string | undefined;
  const str = primary ?? fallback ?? key;
  return interpolate(str, params);
}

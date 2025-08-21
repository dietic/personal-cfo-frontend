"use client";

import rawEn from "@/locales/en.json";
import rawEs from "@/locales/es.json";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "es" | "en";

type Messages = Record<string, string>;

interface I18nContextValue {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function interpolate(
  template: string,
  params?: Record<string, string | number>
) {
  if (!params) return template;
  return template.replace(/\{(.*?)\}/g, (_, k) => String(params[k] ?? ""));
}

// Ensure compatibility whether JSON is exported as default or as a module object
const es = ((rawEs as any)?.default ?? (rawEs as any)) as Messages;
const en = ((rawEn as any)?.default ?? (rawEn as any)) as Messages;

const MESSAGES: Record<Locale, Messages> = {
  es,
  en,
};

export function I18nProvider({
  children,
  defaultLocale = "es",
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("locale")) as Locale | null;
    if (saved === "es" || saved === "en") {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", locale);
      try {
        document.documentElement.lang = locale === "es" ? "es-PE" : "en";
        // Persist to cookie so server can read it
        document.cookie = `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      } catch {}
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const messages = MESSAGES[locale] ?? es;
    const t = (key: string, params?: Record<string, string | number>) => {
      // Prefer current locale; fall back to English; finally the raw key
      const primary = (messages as any)[key] as string | undefined;
      const fallback = (en as any)[key] as string | undefined;
      const str = primary ?? fallback ?? key;
      return interpolate(str, params);
    };
    return { locale, t, setLocale };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

// Non-hook translator for client-only contexts (e.g., hooks/utilities)
export function getCurrentLocale(): Locale {
  try {
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem("locale") as Locale | null)) ||
      null;
    if (saved === "es" || saved === "en") return saved;
  } catch {}
  return "es";
}

export function tInstant(
  key: string,
  params?: Record<string, string | number>
): string {
  const locale = getCurrentLocale();
  const messages = MESSAGES[locale] ?? es;
  const primary = (messages as any)[key] as string | undefined;
  const fallback = (en as any)[key] as string | undefined;
  const str = primary ?? fallback ?? key;
  return interpolate(str, params);
}

"use client";

import { Button } from "@/components/ui/button";
import { tInstant, useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        className={`h-7 px-2 rounded-full text-xs ${
          locale === "es" ? "bg-muted font-medium" : "text-muted-foreground"
        }`}
        onClick={() => setLocale("es")}
        aria-label={tInstant("i18n.switchToSpanish")}
      >
        ES
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={`h-7 px-2 rounded-full text-xs ${
          locale === "en" ? "bg-muted font-medium" : "text-muted-foreground"
        }`}
        onClick={() => setLocale("en")}
        aria-label={tInstant("i18n.switchToEnglish")}
      >
        EN
      </Button>
    </div>
  );
}

"use client";

import { useExchangeRate } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function ExchangeRateNote() {
  const { data: rate } = useExchangeRate();
  const { t } = useI18n();
  if (!rate) return null;

  const value = rate.penPerUsd;
  const formatted = Number.isFinite(value) ? value.toFixed(2) : "-";
  const suffix = rate.usingFixedFallback ? t("exr.suffixFixed") : "";

  return (
    <div className="text-xs text-muted-foreground mt-1">
      {t("exr.prefix", { value: formatted })}
      {suffix}
    </div>
  );
}

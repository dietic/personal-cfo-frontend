"use client";

import { useExchangeRate } from "@/lib/hooks";

export default function ExchangeRateNote() {
  const { data: rate } = useExchangeRate();
  if (!rate) return null;

  const value = rate.penPerUsd;
  const formatted = Number.isFinite(value) ? value.toFixed(2) : "-";
  const suffix = rate.usingFixedFallback ? " • fixed" : "";

  return (
    <div className="text-xs text-muted-foreground mt-1">
      EXR: S/ {formatted} per $1{suffix}
    </div>
  );
}

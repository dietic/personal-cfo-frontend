"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { convertAmount, type SupportedCurrency } from "@/lib/exchange-rates";
import { formatMoney } from "@/lib/format";
import { useCategorySpending, useExchangeRate } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters } from "@/lib/types";
import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Colors for pie chart segments
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff7f",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#ffeaa7",
];

interface SpendingByCategoryProps {
  filters?: AnalyticsFilters;
}

export function SpendingByCategory({ filters }: SpendingByCategoryProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  const { data: categoryData, isLoading, error } = useCategorySpending(filters);

  const data = useMemo(() => {
    if (!categoryData) return [] as Array<{ name: string; amount: number }>;
    return categoryData
      .map((item: { category: string; amount: string; currency: string }) => {
        const raw = Math.abs(parseFloat(item.amount));
        const amt = rate
          ? convertAmount(
              raw,
              (item.currency as SupportedCurrency) || "PEN",
              currency,
              rate
            )
          : raw; // no rate yet, show raw
        return {
          name: item.category || t("common.other"),
          amount: Math.round(amt * 100) / 100,
        };
      })
      .sort(
        (a: { amount: number }, b: { amount: number }) => b.amount - a.amount
      );
  }, [categoryData, rate, currency, t]);

  // currency symbol handled by formatMoney

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.spendingByCategory.title")}</CardTitle>
          <CardDescription>
            {t("analytics.spendingByCategory.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.spendingByCategory.title")}</CardTitle>
          <CardDescription>
            {t("analytics.spendingByCategory.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("analytics.spendingByCategory.loadFailed")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.spendingByCategory.title")}</CardTitle>
          <CardDescription>
            {t("analytics.spendingByCategory.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            {t("analytics.spendingByCategory.empty")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("analytics.spendingByCategory.title")}</CardTitle>
            <CardDescription>
              {t("analytics.spendingByCategory.description")}
            </CardDescription>
            {/* Single EXR note is shown at page level */}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={currency === "PEN" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrency("PEN")}
            >
              PEN
            </Button>
            <Button
              variant={currency === "USD" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrency("USD")}
            >
              USD
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={0}
                fill="#8884d8"
                dataKey="amount"
              >
                {data.map(
                  (entry: { name: string; amount: number }, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip
                formatter={(value: number | string) => [
                  formatMoney(Number(value), currency),
                  t("analytics.tooltip.amount"),
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

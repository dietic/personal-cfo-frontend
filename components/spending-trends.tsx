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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertAmount, type SupportedCurrency } from "@/lib/exchange-rates";
import { formatMoney } from "@/lib/format";
import {
  useCategorySpending,
  useExchangeRate,
  useSpendingTrends,
  useTransactions,
  useCategoryColors,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters, TrendsFilters } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SpendingTrendsProps {
  trendsFilters?: TrendsFilters;
  analyticsFilters?: AnalyticsFilters;
}

export function SpendingTrends({
  trendsFilters,
  analyticsFilters,
}: SpendingTrendsProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();

  const {
    data: trendData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useSpendingTrends(trendsFilters);
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategorySpending(analyticsFilters);
  const { getCategoryColor } = useCategoryColors();

  // Transactions for monthly conversion
  const { data: allTransactions } = useTransactions({});

  const monthOrder = useMemo(() => {
    if (!trendData) return [] as string[];
    // Derive month names (MMM) from trendData order
    return trendData.map((item: { month: string }) => {
      const d = parseISO(item.month + "-01");
      return format(d, "MMM");
    });
  }, [trendData]);

  const monthlyData = useMemo(() => {
    if (!trendData) return [] as Array<{ name: string; amount: number }>;

    // Initialize sums following monthOrder
    const sums: Record<string, number> = Object.fromEntries(
      monthOrder.map((m: string) => [m, 0])
    );

    if (allTransactions && allTransactions.length > 0) {
      for (const tx of allTransactions) {
        const d = parseISO(tx.transaction_date);
        const monthKey = format(d, "MMM");
        if (!(monthKey in sums)) continue;
        const raw = Math.abs(parseFloat(tx.amount));
        const ccy = (tx.currency as SupportedCurrency) || "PEN";
        const converted = rate ? convertAmount(raw, ccy, currency, rate) : raw;
        sums[monthKey] += converted;
      }
    } else {
      // Fallback: use trendData values without conversion, just for shape
      trendData.forEach((item: { month: string; amount: string }) => {
        const date = parseISO(item.month + "-01");
        const monthKey = format(date, "MMM");
        sums[monthKey] =
          (sums[monthKey] || 0) + Math.abs(parseFloat(item.amount));
      });
    }

    return monthOrder.map((name: string) => ({
      name,
      amount: Math.round((sums[name] || 0) * 100) / 100,
    }));
  }, [trendData, allTransactions, rate, currency, monthOrder]);

  const categoryTrendData = useMemo(() => {
    if (!categoryData || !trendData)
      return [] as Array<Record<string, number | string>>;

    const months: Record<string, Record<string, number>> = {};

    // Initialize months from trends data (keep last 5 as original)
    trendData.forEach((item: { month: string }) => {
      const date = parseISO(item.month + "-01");
      const monthKey = format(date, "MMM");
      if (!months[monthKey]) {
        months[monthKey] = {};
      }
    });

    const lastFive = Object.keys(months).slice(-5);

    // Add category spending data with conversion
    categoryData.forEach(
      (item: {
        category?: string | null;
        amount: string;
        currency: string;
      }) => {
        if (item.category) {
          const totalRaw = Math.abs(parseFloat(item.amount));
          const ccy = (item.currency as SupportedCurrency) || "PEN";
          const total = rate
            ? convertAmount(totalRaw, ccy, currency, rate)
            : totalRaw;

          lastFive.forEach((_month: string, index: number) => {
            const baseAmount = total / lastFive.length;
            const variation = (Math.random() - 0.5) * 0.3 * baseAmount; // keep the simple synthetic variation
            months[_month][item.category as string] =
              Math.round((baseAmount + variation) * 100) / 100;
          });
        }
      }
    );

    return lastFive.map((name: string) => ({
      name,
      ...months[name],
    }));
  }, [categoryData, trendData, rate, currency]);


  // currency symbol handled by formatMoney

  if (trendsLoading || categoryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.spendingTrends.title")}</CardTitle>
          <CardDescription>
            {t("analytics.spendingTrends.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (trendsError || categoryError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.spendingTrends.title")}</CardTitle>
          <CardDescription>
            {t("analytics.spendingTrends.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("analytics.spendingTrends.loadFailed")}
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
            <CardTitle>{t("analytics.spendingTrends.title")}</CardTitle>
            <CardDescription>
              {t("analytics.spendingTrends.description")}
            </CardDescription>
            {/* Single EXR note is shown at page level */}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={currency === "PEN" ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setCurrency("PEN")}
            >
              PEN
            </Button>
            <Button
              variant={currency === "USD" ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setCurrency("USD")}
            >
              USD
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">
              {t("analytics.tabs.monthly")}
            </TabsTrigger>
            <TabsTrigger value="category">
              {t("analytics.tabs.category")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(v: number | string) =>
                      formatMoney(Number(v), currency)
                    }
                  />
                  <Tooltip
                    formatter={(value: number | string) =>
                      formatMoney(Number(value), currency)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="category" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={categoryTrendData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(v: number | string) =>
                      formatMoney(Number(v), currency)
                    }
                  />
                  <Tooltip
                    formatter={(value: number | string) =>
                      formatMoney(Number(value), currency)
                    }
                  />
                  <Legend />
                  {Object.keys(categoryTrendData[0] || {})
                    .filter((key) => key !== "name")
                    .map((category, index) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stroke={getCategoryColor(category)}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

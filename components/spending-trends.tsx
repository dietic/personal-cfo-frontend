"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpendingTrends, useCategorySpending, useTransactions } from "@/lib/hooks";
import { format, parseISO } from "date-fns";
import type { TrendsFilters, AnalyticsFilters, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useExchangeRate } from "@/lib/hooks";
import { convertAmount, getCurrencySymbol, type SupportedCurrency } from "@/lib/exchange-rates";

interface SpendingTrendsProps {
  trendsFilters?: TrendsFilters;
  analyticsFilters?: AnalyticsFilters;
}

export function SpendingTrends({
  trendsFilters,
  analyticsFilters,
}: SpendingTrendsProps) {
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

  // Transactions for monthly conversion
  const { data: allTransactions } = useTransactions({});

  const monthOrder = useMemo(() => {
    if (!trendData) return [] as string[];
    // Derive month names (MMM) from trendData order
    return trendData.map((item) => {
      const d = parseISO(item.month + "-01");
      return format(d, "MMM");
    });
  }, [trendData]);

  const monthlyData = useMemo(() => {
    if (!trendData) return [] as Array<{ name: string; amount: number }>;

    // Initialize sums following monthOrder
    const sums: Record<string, number> = Object.fromEntries(
      monthOrder.map((m) => [m, 0])
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
      trendData.forEach((item) => {
        const date = parseISO(item.month + "-01");
        const monthKey = format(date, "MMM");
        sums[monthKey] = (sums[monthKey] || 0) + Math.abs(parseFloat(item.amount));
      });
    }

    return monthOrder.map((name) => ({
      name,
      amount: Math.round((sums[name] || 0) * 100) / 100,
    }));
  }, [trendData, allTransactions, rate, currency, monthOrder]);

  const categoryTrendData = useMemo(() => {
    if (!categoryData || !trendData) return [] as Array<Record<string, number | string>>;

    const months: Record<string, Record<string, number>> = {};

    // Initialize months from trends data (keep last 5 as original)
    trendData.forEach((item) => {
      const date = parseISO(item.month + "-01");
      const monthKey = format(date, "MMM");
      if (!months[monthKey]) {
        months[monthKey] = {};
      }
    });

    const lastFive = Object.keys(months).slice(-5);

    // Add category spending data with conversion
    categoryData.forEach((item) => {
      if (item.category) {
        const totalRaw = Math.abs(parseFloat(item.amount));
        const ccy = (item.currency as SupportedCurrency) || "PEN";
        const total = rate ? convertAmount(totalRaw, ccy, currency, rate) : totalRaw;

        lastFive.forEach((_month, index) => {
          const baseAmount = total / lastFive.length;
          const variation = (Math.random() - 0.5) * 0.3 * baseAmount; // keep the simple synthetic variation
          months[_month][item.category] =
            Math.round((baseAmount + variation) * 100) / 100;
        });
      }
    });

    return lastFive.map((name) => ({
      name,
      ...months[name],
    }));
  }, [categoryData, trendData, rate, currency]);

  const categoryColors = [
    "hsl(var(--primary))",
    "hsl(var(--destructive))",
    "hsl(var(--secondary))",
    "hsl(var(--muted-foreground))",
    "hsl(142, 76%, 36%)",
    "hsl(262, 83%, 58%)",
  ];

  const symbol = getCurrencySymbol(currency);

  if (trendsLoading || categoryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>
            Track your spending patterns over time
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
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>
            Track your spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Failed to load spending trends data
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
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>
              Track your spending patterns over time
            </CardDescription>
            {rate?.usingFixedFallback && (
              <div className="text-xs text-muted-foreground mt-1">
                Using fallback rate S/ 3.50 per $1
              </div>
            )}
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
        <Tabs defaultValue="monthly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly Spending</TabsTrigger>
            <TabsTrigger value="category">Category Trends</TabsTrigger>
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
                  <YAxis tickFormatter={(v) => `${symbol}${Number(v).toLocaleString()}`} />
                  <Tooltip formatter={(value) => `${symbol}${Number(value).toLocaleString()}`} />
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
                  <YAxis tickFormatter={(v) => `${symbol}${Number(v).toLocaleString()}`} />
                  <Tooltip formatter={(value) => `${symbol}${Number(value).toLocaleString()}`} />
                  <Legend />
                  {Object.keys(categoryTrendData[0] || {})
                    .filter((key) => key !== "name")
                    .map((category, index) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stroke={categoryColors[index % categoryColors.length]}
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

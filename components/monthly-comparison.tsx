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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpendingTrends, useTransactions } from "@/lib/hooks";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import type { TrendsFilters, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useExchangeRate } from "@/lib/hooks";
import {
  convertAmount,
  getCurrencySymbol,
  type SupportedCurrency,
} from "@/lib/exchange-rates";

interface MonthlyComparisonProps {
  filters?: TrendsFilters;
}

export function MonthlyComparison({ filters }: MonthlyComparisonProps) {
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  const { data: trendData, isLoading, error } = useSpendingTrends(filters);
  const { data: allTransactions } = useTransactions({});

  // Build comparison from last two years and first 6 months using transactions (with conversion)
  const comparisonData = useMemo(() => {
    const monthsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]; // first 6 months

    if (!allTransactions || allTransactions.length === 0) {
      // Fallback to trends (no conversion)
      if (!trendData) return [] as Array<Record<string, any>>;
      const yearlyData: Record<number, Record<string, number>> = {};
      trendData.forEach((item) => {
        const date = parseISO(item.month + "-01");
        const year = date.getFullYear();
        const monthName = format(date, "MMM");
        yearlyData[year] = yearlyData[year] || {};
        yearlyData[year][monthName] = (yearlyData[year][monthName] || 0) + Math.abs(parseFloat(item.amount));
      });
      const years = Object.keys(yearlyData).map(Number).sort().slice(-2);
      if (years.length < 2) return [];
      const [prevYear, currentYear] = years;
      return monthsLabels.map((m) => ({
        name: m,
        [prevYear.toString()]: Math.round((yearlyData[prevYear]?.[m] || 0) * 100) / 100,
        [currentYear.toString()]: Math.round((yearlyData[currentYear]?.[m] || 0) * 100) / 100,
      }));
    }

    // Compute last two years for transactions present
    const yearsSet = new Set<number>();
    for (const tx of allTransactions) {
      const y = parseISO(tx.transaction_date).getFullYear();
      yearsSet.add(y);
    }
    const years = Array.from(yearsSet).sort().slice(-2);
    if (years.length < 2) return [] as Array<Record<string, any>>;
    const [prevYear, currentYear] = years;

    const sums: Record<number, Record<string, number>> = {
      [prevYear]: Object.fromEntries(monthsLabels.map((m) => [m, 0])),
      [currentYear]: Object.fromEntries(monthsLabels.map((m) => [m, 0])),
    } as any;

    for (const tx of allTransactions) {
      const d = parseISO(tx.transaction_date);
      const y = d.getFullYear();
      if (y !== prevYear && y !== currentYear) continue;
      const monthName = format(d, "MMM");
      const raw = Math.abs(parseFloat(tx.amount));
      const ccy = (tx.currency as SupportedCurrency) || "PEN";
      const converted = rate ? convertAmount(raw, ccy, currency, rate) : raw;
      if (monthsLabels.includes(monthName)) {
        sums[y][monthName] += converted;
      }
    }

    return monthsLabels.map((m) => ({
      name: m,
      [prevYear.toString()]: Math.round((sums[prevYear][m] || 0) * 100) / 100,
      [currentYear.toString()]: Math.round((sums[currentYear][m] || 0) * 100) / 100,
    }));
  }, [allTransactions, trendData, rate, currency]);

  if (isLoading && (!allTransactions || allTransactions.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>Compare spending with previous year</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>Compare spending with previous year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Failed to load comparison data
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the years for the legend
  const years =
    comparisonData.length > 0
      ? Object.keys(comparisonData[0]).filter((key) => key !== "name")
      : [];

  const symbol = getCurrencySymbol(currency);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Comparison</CardTitle>
            <CardDescription>Compare spending with previous year</CardDescription>
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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
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
              {years.map((year, index) => (
                <Bar
                  key={year}
                  dataKey={year}
                  fill={
                    index === 0
                      ? "hsl(var(--muted-foreground))"
                      : "hsl(var(--primary))"
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCategorySpending } from "@/lib/hooks";
import type { AnalyticsFilters } from "@/lib/types";
import { useState, useMemo } from "react";
import { useExchangeRate } from "@/lib/hooks";
import { convertAmount, getCurrencySymbol, type SupportedCurrency } from "@/lib/exchange-rates";

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
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  const { data: categoryData, isLoading, error } = useCategorySpending(filters);

  const data = useMemo(() => {
    if (!categoryData) return [] as Array<{ name: string; amount: number }>;
    return categoryData
      .map((item) => {
        const raw = Math.abs(parseFloat(item.amount));
        const amt = rate
          ? convertAmount(raw, (item.currency as SupportedCurrency) || "PEN", currency, rate)
          : raw; // no rate yet, show raw
        return {
          name: item.category || "Other",
          amount: Math.round(amt * 100) / 100,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [categoryData, rate, currency]);

  const symbol = getCurrencySymbol(currency);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            Your spending breakdown for the selected period
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
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            Your spending breakdown for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Failed to load category spending data
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            Your spending breakdown for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No transactions found for the selected date range
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
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Your spending breakdown for the selected period
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
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${symbol}${Number(value).toFixed(2)}`,
                  "Amount",
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

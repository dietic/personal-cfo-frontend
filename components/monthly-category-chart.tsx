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
import {
  useMonthlyCategoryBreakdown,
  useExchangeRate,
  useTransactions,
  useCategoryColors,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters, TrendsFilters } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyCategoryChartProps {
  trendsFilters?: TrendsFilters;
  analyticsFilters?: AnalyticsFilters;
}


export function MonthlyCategoryChart({
  trendsFilters,
  analyticsFilters,
}: MonthlyCategoryChartProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  const { getCategoryColor } = useCategoryColors();

  const {
    data: monthlyData,
    isLoading,
    error,
  } = useMonthlyCategoryBreakdown(trendsFilters);

  // Get all transactions for currency conversion
  const { data: allTransactions } = useTransactions({});

  // Process data for stacked bar chart
  const chartData = useMemo(() => {
    if (!monthlyData) return [];

    // Get all unique categories across all months
    const allCategories = new Set<string>();
    monthlyData.forEach((monthData) => {
      Object.keys(monthData.categories).forEach((category) => {
        allCategories.add(category);
      });
    });

    // Convert amounts and prepare data for bar chart
    return monthlyData.map((monthData) => {
      const monthEntry: any = {
        name: format(parseISO(monthData.month + "-01"), "MMM"),
        month: monthData.month,
      };

      // Convert each category amount with proper currency handling
      Object.entries(monthData.categories).forEach(([category, currencyAmounts]) => {
        let totalConverted = 0;
        
        // Convert each currency amount separately
        Object.entries(currencyAmounts).forEach(([txnCurrency, amountStr]) => {
          const rawAmount = Math.abs(parseFloat(amountStr));
          const converted = rate ? convertAmount(
            rawAmount, 
            txnCurrency as SupportedCurrency, 
            currency, 
            rate
          ) : rawAmount;
          totalConverted += converted;
        });
        
        monthEntry[category] = Math.round(totalConverted * 100) / 100;
      });

      // Fill missing categories with 0
      allCategories.forEach((category) => {
        if (!(category in monthEntry)) {
          monthEntry[category] = 0;
        }
      });

      return monthEntry;
    });
  }, [monthlyData, rate, currency]);


  // Get all unique categories for legend, with Income first
  const categories = useMemo(() => {
    const allCats = new Set<string>();
    monthlyData?.forEach((data) => {
      Object.keys(data.categories).forEach((cat) => allCats.add(cat));
    });
    
    const categoriesArray = Array.from(allCats);
    
    // Sort categories to put Income last (on top of stack), then sort the rest alphabetically
    return categoriesArray.sort((a, b) => {
      if (a.toLowerCase() === "income") return 1;
      if (b.toLowerCase() === "income") return -1;
      return a.localeCompare(b);
    });
  }, [monthlyData]);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            {payload
              .filter((entry: any) => entry.value > 0)
              .sort((a: any, b: any) => b.value - a.value)
              .map((entry: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.dataKey}</span>
                  </div>
                  <span className="font-medium">
                    {formatMoney(entry.value, currency)}
                  </span>
                </div>
              ))}
            <div className="border-t pt-1 mt-1 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatMoney(total, currency)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
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

  if (error) {
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
        <div className="h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
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
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              {categories.map((category) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="a"
                  fill={getCategoryColor(category)}
                  stroke="hsl(var(--background))"
                  strokeWidth={1}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
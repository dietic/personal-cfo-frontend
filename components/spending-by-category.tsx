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
import { convertAmount, getCurrencySymbol, type SupportedCurrency } from "@/lib/exchange-rates";
import { formatMoney, formatNumber } from "@/lib/format";
import { useCategorySpending, useExchangeRate, useCategoryColors } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters } from "@/lib/types";
import { useMemo, useState, useCallback } from "react";
import { AnalyticsDateFilter } from "@/components/analytics-date-filter";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";


interface SpendingByCategoryProps {
  filters?: AnalyticsFilters;
}

interface CustomTooltipProps {
  currency: SupportedCurrency;
  active?: boolean;
  payload?: any[];
}

const CustomTooltip = ({ active, payload, currency }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{data.emoji}</span>
          <p className="font-medium">{data.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm">
            {getCurrencySymbol(currency)}{formatNumber(data.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.percentage}% of total
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function SpendingByCategory({ filters }: SpendingByCategoryProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const [dateFilters, setDateFilters] = useState<AnalyticsFilters>(filters || {});
  const { data: rate } = useExchangeRate();
  const { data: categoryData, isLoading, error } = useCategorySpending(dateFilters);
  const { getCategoryColor, getCategoryEmoji } = useCategoryColors();

  const handleDateRangeChange = useCallback(
    (startDate?: string, endDate?: string) => {
      setDateFilters(prev => ({
        ...prev,
        start_date: startDate,
        end_date: endDate,
      }));
    },
    []
  );

  const data = useMemo(() => {
    if (!categoryData) return [] as Array<{ name: string; amount: number }>;
    
    // Consolidate uncategorized entries and filter out income
    const consolidatedData = new Map<string, number>();
    
    categoryData
      .filter((item: { category: string }) => 
        item.category && !item.category.toLowerCase().includes("income")
      )
      .forEach((item: { category: string; amount: string; currency: string }) => {
        const raw = Math.abs(parseFloat(item.amount));
        const amt = rate
          ? convertAmount(
              raw,
              (item.currency as SupportedCurrency) || "PEN",
              currency,
              rate
            )
          : raw;
        
        // Use category name as-is from backend (already localized)
        const categoryName = item.category || t("common.other");
        const normalizedName = categoryName;
        
        consolidatedData.set(
          normalizedName,
          (consolidatedData.get(normalizedName) || 0) + amt
        );
      });
    
    const dataArray = Array.from(consolidatedData.entries())
      .map(([name, amount]) => ({
        name,
        amount: Math.round(amount * 100) / 100,
        emoji: getCategoryEmoji(name) || "📊",
      }))
      .sort((a, b) => b.amount - a.amount);
    
    // Calculate total and add percentages
    const totalAmount = dataArray.reduce((sum, item) => sum + item.amount, 0);
    return dataArray.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(2) : "0.00"
    }));
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("analytics.spendingByCategory.title")}</CardTitle>
              <CardDescription>
                {t("analytics.spendingByCategory.description")}
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
          <div className="mb-4">
            <AnalyticsDateFilter
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
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
        <div className="mb-4">
          <AnalyticsDateFilter
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={0}
                fill="#8884d8"
                dataKey="amount"
                labelLine={false}
                label={false}
                paddingAngle={1}
                cornerRadius={4}
              >
                {data.map(
                  (entry: { name: string; amount: number }) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={getCategoryColor(entry.name)}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  )
                )}
              </Pie>
              <Tooltip content={<CustomTooltip currency={currency} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Color chip legend like category trends */}
        {data.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {data.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(item.name) }}
                  />
                  <span className="font-medium text-xs truncate max-w-20">{item.name}</span>
                </div>
              ))}
              {data.length > 6 && (
                <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <span className="font-medium text-xs">+{data.length - 6} más</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

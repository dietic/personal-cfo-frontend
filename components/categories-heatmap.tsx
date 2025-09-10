"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  convertAmount,
  getCurrencySymbol,
  type SupportedCurrency,
} from "@/lib/exchange-rates";
import { formatNumber } from "@/lib/format";
import {
  useExchangeRate,
  useCategorySpending,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters } from "@/lib/types";
import { useMemo, useState } from "react";

interface CategoriesHeatmapProps {
  filters?: AnalyticsFilters;
}

export function CategoriesHeatmap({ filters }: CategoriesHeatmapProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  const { data: categoryData, isLoading, error } = useCategorySpending(filters);

  // Process category data for heatmap
  const heatmapData = useMemo(() => {
    if (!categoryData || categoryData.length === 0) return [];

    // Group by category and convert amounts
    const categoryMap = new Map<string, number>();
    
    categoryData.forEach(item => {
      const rawAmount = Math.abs(parseFloat(item.amount.toString()));
      const converted = rate ? convertAmount(rawAmount, item.currency as SupportedCurrency, currency, rate) : rawAmount;
      
      if (categoryMap.has(item.category)) {
        categoryMap.set(item.category, categoryMap.get(item.category)! + converted);
      } else {
        categoryMap.set(item.category, converted);
      }
    });

    // Convert to array and sort by amount
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        transactionCount: categoryData
          .filter(item => item.category === category)
          .reduce((sum, item) => sum + item.transaction_count, 0)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [categoryData, rate, currency]);

  // Get max amount for scaling
  const maxAmount = useMemo(() => {
    return heatmapData.length > 0 ? Math.max(...heatmapData.map(item => item.amount)) : 0;
  }, [heatmapData]);

  // Function to get intensity color based on amount
  const getHeatmapColor = (amount: number, maxAmount: number) => {
    if (maxAmount === 0) return "bg-blue-100";
    
    const intensity = amount / maxAmount;
    
    if (intensity > 0.8) return "bg-red-500 text-white";
    if (intensity > 0.6) return "bg-orange-400 text-white";
    if (intensity > 0.4) return "bg-yellow-300";
    if (intensity > 0.2) return "bg-green-200";
    return "bg-blue-100";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.categoriesHeatmap.title")}</CardTitle>
          <CardDescription>
            {t("analytics.categoriesHeatmap.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.categoriesHeatmap.title")}</CardTitle>
          <CardDescription>
            {t("analytics.categoriesHeatmap.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            {t("analytics.categoriesHeatmap.loadFailed")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const symbol = getCurrencySymbol(currency);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("analytics.categoriesHeatmap.title")}</CardTitle>
            <CardDescription>
              {t("analytics.categoriesHeatmap.description")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-2 py-1 text-xs rounded ${
                currency === "PEN" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setCurrency("PEN")}
            >
              PEN
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${
                currency === "USD" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setCurrency("USD")}
            >
              USD
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {heatmapData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("analytics.categoriesHeatmap.noData")}
            </div>
          ) : (
            heatmapData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between p-2 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.category}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.transactionCount} {t("analytics.categoriesHeatmap.transactions")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {symbol}{formatNumber(item.amount)}
                  </div>
                  <div 
                    className={`w-4 h-4 rounded ${getHeatmapColor(item.amount, maxAmount)}`}
                    title={`${Math.round((item.amount / maxAmount) * 100)}% of max spending`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Legend */}
        {heatmapData.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              {t("analytics.categoriesHeatmap.legend")}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 rounded" />
                <span>{t("analytics.categoriesHeatmap.low")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 rounded" />
                <span>{t("analytics.categoriesHeatmap.medium")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-300 rounded" />
                <span>{t("analytics.categoriesHeatmap.high")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded" />
                <span>{t("analytics.categoriesHeatmap.veryHigh")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>{t("analytics.categoriesHeatmap.max")}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
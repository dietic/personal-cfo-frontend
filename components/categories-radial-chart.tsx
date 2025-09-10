"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  convertAmount,
  getCurrencySymbol,
  type SupportedCurrency,
} from "@/lib/exchange-rates";
import { formatNumber } from "@/lib/format";
import {
  useExchangeRate,
  useCategorySpending,
  useCategories,
  useCategoryColors,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters } from "@/lib/types";
import { useMemo, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoriesRadialChartProps {
  filters?: AnalyticsFilters;
}

export function CategoriesRadialChart({ filters }: CategoriesRadialChartProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  const { data: categoryData, isLoading, error } = useCategorySpending(filters);
  const { data: categories } = useCategories();
  const { getCategoryEmoji } = useCategoryColors();

  // Process category data for radar chart
  const chartData = useMemo(() => {
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

    // Convert to array for radar chart
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        subject: category,
        amount: Math.round(amount * 100) / 100,
        emoji: getCategoryEmoji(category) || "📊",
        fullMark: Math.max(...Array.from(categoryMap.values())) * 1.2, // 20% padding for max value
        transactionCount: categoryData
          .filter(item => item.category === category)
          .reduce((sum, item) => sum + item.transaction_count, 0)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [categoryData, rate, currency, getCategoryEmoji]);

  // Get max amount for scaling
  const maxAmount = useMemo(() => {
    return chartData.length > 0 ? Math.max(...chartData.map(item => item.amount)) : 0;
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{data.emoji}</span>
            <p className="font-medium">{data.subject}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              {getCurrencySymbol(currency)}{formatNumber(data.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.transactionCount} {t("analytics.categoriesHeatmap.transactions")}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderPolarAngleAxis = (props: any) => {
    const { x, y, payload } = props;
    const emoji = getCategoryEmoji(payload.value) || "📊";
    
    return (
      <text 
        x={x} 
        y={y} 
        textAnchor="middle" 
        className="text-xl font-emoji"
        dy={-8}
      >
        {emoji}
      </text>
    );
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
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
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
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("analytics.categoriesHeatmap.loadFailed")}
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
            <CardTitle>{t("analytics.categoriesHeatmap.title")}</CardTitle>
            <CardDescription>
              {t("analytics.categoriesHeatmap.description")}
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
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("analytics.categoriesHeatmap.noData")}
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <PolarGrid 
                  stroke="hsl(var(--border))" 
                  strokeWidth={1}
                  radialLines={true}
                  polarRadius={[0, 25, 50, 75]}
                />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={renderPolarAngleAxis}
                  tickLine={false}
                  axisLine={false}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, maxAmount * 1.2]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Spending"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  dot={{ 
                    fill: "hsl(var(--primary))", 
                    strokeWidth: 2, 
                    r: 4,
                    stroke: "hsl(var(--background))"
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: "hsl(var(--primary))", 
                    strokeWidth: 2, 
                    fill: "hsl(var(--background))" 
                  }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ 
                    stroke: "hsl(var(--border))", 
                    strokeWidth: 1, 
                    strokeDasharray: "3 3" 
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            
            {/* Legend with category names */}
            {chartData.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  {chartData.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full">
                      <span className="text-sm">{item.emoji}</span>
                      <span className="font-medium">{item.subject}</span>
                    </div>
                  ))}
                  {chartData.length > 6 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full">
                      <span className="text-sm">➕</span>
                      <span className="font-medium">+{chartData.length - 6} more</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
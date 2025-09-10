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
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { convertAmount, type SupportedCurrency } from "@/lib/exchange-rates";
import { formatMoney } from "@/lib/format";
import {
  useMonthlyCategoryBreakdown,
  useExchangeRate,
  useCategoryColors,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { TrendsFilters } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategoryTrendsChartProps {
  trendsFilters?: TrendsFilters;
}

export function CategoryTrendsChart({ trendsFilters }: CategoryTrendsChartProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  const { getCategoryColor } = useCategoryColors();
  
  const {
    data: monthlyData,
    isLoading,
    error,
  } = useMonthlyCategoryBreakdown(trendsFilters);

  // Get all unique categories (excluding Income)
  const allCategories = useMemo(() => {
    if (!monthlyData) return [];
    
    const categories = new Set<string>();
    monthlyData.forEach((monthData) => {
      Object.keys(monthData.categories).forEach((category) => {
        if (category.toLowerCase() !== "income") {
          categories.add(category);
        }
      });
    });
    
    return Array.from(categories).sort();
  }, [monthlyData]);

  // State for selected categories (default: all categories)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const hasSetDefaultCategories = useRef(false);
  
  // Debug selected categories
  useEffect(() => {
    console.log("Selected categories:", selectedCategories);
  }, [selectedCategories]);

  // Update selected categories when allCategories changes (data loads)
  useEffect(() => {
    if (allCategories.length > 0 && !hasSetDefaultCategories.current) {
      setSelectedCategories(allCategories);
      hasSetDefaultCategories.current = true;
    }
  }, [allCategories]);

  // Prepare options for multi-select
  const categoryOptions = useMemo((): MultiSelectOption[] => {
    return allCategories.map(category => ({
      value: category,
      label: category,
      color: getCategoryColor(category),
    }));
  }, [allCategories, getCategoryColor]);

  // Process data for line chart - show all months of current year with zeros
  const chartData = useMemo(() => {
    if (!monthlyData) return [];

    // Always show all months of the current year
    const currentYear = new Date().getFullYear();
    const allMonths: string[] = [];
    
    // Generate all months of the current year
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      allMonths.push(format(date, "yyyy-MM"));
    }

    // Create a map of existing month data for quick lookup
    const monthDataMap = new Map();
    monthlyData.forEach(monthData => {
      monthDataMap.set(monthData.month, monthData.categories);
    });

    // Process each month, filling in zeros for missing data
    return allMonths.map(month => {
      const monthData = monthDataMap.get(month);
      const monthEntry: any = {
        name: format(parseISO(month + "-01"), "MMM yyyy"),
        month: month,
        fullDate: parseISO(month + "-01"),
      };

      // Initialize all categories to 0
      allCategories.forEach(category => {
        monthEntry[category] = 0;
      });

      // Fill in actual data for this month if it exists
      if (monthData) {
        Object.entries(monthData).forEach(([category, currencyAmounts]) => {
          if (category.toLowerCase() === "income") return; // Skip income
          
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
      }

      return monthEntry;
    });
  }, [monthlyData, rate, currency, allCategories]);

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
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
          <CardTitle>{t("analytics.categoryTrends.title")}</CardTitle>
          <CardDescription>
            {t("analytics.categoryTrends.description")}
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
          <CardTitle>{t("analytics.categoryTrends.title")}</CardTitle>
          <CardDescription>
            {t("analytics.categoryTrends.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("analytics.categoryTrends.loadFailed")}
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
            <CardTitle>{t("analytics.categoryTrends.title")}</CardTitle>
            <CardDescription>
              {t("analytics.categoryTrends.description")}
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
        {/* Category selection multi-select */}
        {allCategories.length > 0 && (
          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm font-medium">
                {t("analytics.categoryTrends.selectCategories")}
              </span>
            </div>
            <MultiSelect
              options={categoryOptions}
              value={selectedCategories}
              onValueChange={setSelectedCategories}
              placeholder={t("analytics.categoryTrends.selectCategoriesPlaceholder")}
              searchPlaceholder={t("analytics.categoryTrends.searchCategories")}
              emptyText={t("analytics.categoryTrends.noCategories")}
              className="min-h-12"
            />
          </div>
        )}

        <div className="h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v: number | string) =>
                  formatMoney(Number(v), currency)
                }
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {selectedCategories.map((category) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={getCategoryColor(category)}
                  strokeWidth={2}
                  dot={{ fill: getCategoryColor(category), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getCategoryColor(category), strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom chip legend */}
        {selectedCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {selectedCategories.slice(0, 8).map((category) => (
                <div key={category} className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md border">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(category) }}
                  />
                  <span className="font-medium text-xs truncate max-w-20">{category}</span>
                </div>
              ))}
              {selectedCategories.length > 8 && (
                <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md border">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <span className="font-medium text-xs">+{selectedCategories.length - 8} más</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
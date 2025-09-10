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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertAmount, type SupportedCurrency } from "@/lib/exchange-rates";
import { formatMoney } from "@/lib/format";
import {
  useMonthlyCategoryBreakdown,
  useExchangeRate,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { TrendsFilters } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { useMemo, useState, useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlySpendingChartProps {
  trendsFilters?: TrendsFilters;
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
        <p className="font-medium mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <p className="font-medium">
            {formatMoney(data.amount, currency)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function MonthlySpendingChart({ trendsFilters }: MonthlySpendingChartProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  
  const periodFilters = { period: 'monthly' };
  
  const handlePeriodChange = (period: string) => {
    // Only monthly is supported now, so this is a no-op
    // Previously this would have handled weekly/monthly switching
  };
  
  const {
    data: monthlyData,
    isLoading,
    error,
  } = useMonthlyCategoryBreakdown({ months: 12 });


  // Process data for monthly spending histogram
  const chartData = useMemo(() => {
    if (monthlyData) {
      // Create a map of available monthly data
      const monthlyDataMap = new Map();
      monthlyData.forEach((monthData) => {
        let totalMonthSpending = 0;
        
        // Calculate total spending for the month across all categories
        Object.entries(monthData.categories).forEach(([category, currencyAmounts]) => {
          // Skip income categories
          if (category.toLowerCase().includes("income")) return;
          
          Object.entries(currencyAmounts).forEach(([txnCurrency, amountStr]) => {
            const rawAmount = Math.abs(parseFloat(amountStr));
            const converted = rate ? convertAmount(
              rawAmount, 
              txnCurrency as SupportedCurrency, 
              currency, 
              rate
            ) : rawAmount;
            totalMonthSpending += converted;
          });
        });

        monthlyDataMap.set(monthData.month, {
          name: format(parseISO(monthData.month + "-01"), "MMM yyyy"),
          month: monthData.month,
          amount: Math.round(totalMonthSpending * 100) / 100,
        });
      });

      // Generate current year timeline (January to December 2025)
      const currentYear = 2025;
      const currentYearMonths = [];
      
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const monthValue = `${currentYear}-${(month + 1).toString().padStart(2, '0')}`;
        const monthName = format(date, "MMM yyyy");
        
        // Use available data or create zero entry
        if (monthlyDataMap.has(monthValue)) {
          currentYearMonths.push(monthlyDataMap.get(monthValue));
        } else {
          currentYearMonths.push({
            name: monthName,
            month: monthValue,
            amount: 0,
          });
        }
      }

      return currentYearMonths;
    }
    
    return [];
  }, [monthlyData, rate, currency]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("analytics.monthlySpending.title")}
          </CardTitle>
          <CardDescription>
            {t("analytics.monthlySpending.description")}
          </CardDescription>
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
          <CardTitle>
            {t("analytics.monthlySpending.title")}
          </CardTitle>
          <CardDescription>
            {t("analytics.monthlySpending.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("analytics.monthlySpending.loadFailed")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("analytics.monthlySpending.title")}
          </CardTitle>
          <CardDescription>
            {t("analytics.monthlySpending.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("analytics.monthlySpending.noData")}
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
            <CardTitle>
              {t("analytics.monthlySpending.title")}
            </CardTitle>
            <CardDescription>
              {t("analytics.monthlySpending.description")}
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
        <div className="h-[300px] w-full">
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
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Yearly Spending Summary */}
        {chartData.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t("analytics.monthlySpending.totalYearly")}
                </p>
                <p className="text-lg font-semibold">
                  {formatMoney(
                    chartData.reduce((sum, month) => sum + month.amount, 0),
                    currency
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t("analytics.monthlySpending.averageMonthly")}
                </p>
                <p className="text-lg font-semibold">
                  {chartData.filter(month => month.amount > 0).length > 0 ? 
                    formatMoney(
                      chartData.reduce((sum, month) => sum + month.amount, 0) / 
                      chartData.filter(month => month.amount > 0).length,
                      currency
                    ) : 
                    formatMoney(0, currency)
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
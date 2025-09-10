"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { convertAmount, type SupportedCurrency } from "@/lib/exchange-rates";
import { formatMoney } from "@/lib/format";
import {
  useMonthlyCategoryBreakdown,
  useExchangeRate,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { format, parseISO, subMonths, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

interface SpendingOverviewChartProps {
  className?: string;
}

interface ChartDataItem {
  month: string;
  monthKey: string;
  income: number;
  expenses: number;
  net: number;
  isPositive: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  currency: SupportedCurrency;
}

const CustomTooltip = ({ active, payload, currency }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-2">{data.month}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Income:</span>
            <span className="font-medium text-green-600">
              {formatMoney(data.income, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Expenses:</span>
            <span className="font-medium text-red-600">
              {formatMoney(data.expenses, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-muted-foreground">Net:</span>
            <span className={`font-semibold ${data.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(data.net, currency)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function SpendingOverviewChart({ className }: SpendingOverviewChartProps) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("PEN");
  const { data: rate } = useExchangeRate();
  
  // Default to previous month
  const currentMonth = startOfMonth(new Date());
  const previousMonth = subMonths(currentMonth, 1);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(previousMonth, "yyyy-MM"));
  
  const {
    data: monthlyData,
    isLoading,
    error,
  } = useMonthlyCategoryBreakdown({ months: 12 });

  const chartData = useMemo(() => {
    if (!monthlyData) return [];

    const monthlyDataMap = new Map<string, { income: number; expenses: number }>();
    
    monthlyData.forEach((monthData) => {
      let monthIncome = 0;
      let monthExpenses = 0;

      Object.entries(monthData.categories).forEach(([category, currencyAmounts]) => {
        const isIncome = category.toLowerCase().includes("income");
        
        Object.entries(currencyAmounts).forEach(([txnCurrency, amountStr]) => {
          const rawAmount = parseFloat(amountStr);
          const converted = rate ? convertAmount(
            Math.abs(rawAmount),
            txnCurrency as SupportedCurrency,
            currency,
            rate
          ) : Math.abs(rawAmount);

          if (isIncome) {
            monthIncome += converted;
          } else {
            monthExpenses += converted;
          }
        });
      });

      monthlyDataMap.set(monthData.month, {
        income: Math.round(monthIncome * 100) / 100,
        expenses: Math.round(monthExpenses * 100) / 100,
      });
    });

    const currentYear = new Date().getFullYear();
    const chartData: ChartDataItem[] = [];

    for (let month = 0; month < 12; month++) {
      const monthNumber = month + 1;
      const monthKey = `${currentYear}-${monthNumber.toString().padStart(2, '0')}`;
      const monthName = format(new Date(currentYear, month, 1), "MMM yyyy");
      
      const monthData = monthlyDataMap.get(monthKey) || { income: 0, expenses: 0 };
      const net = monthData.income - monthData.expenses;

      chartData.push({
        month: monthName,
        monthKey,
        income: monthData.income,
        expenses: monthData.expenses,
        net,
        isPositive: net >= 0,
      });
    }

    return chartData;
  }, [monthlyData, rate, currency]);

  // Get available months for selection
  const availableMonths = useMemo(() => {
    if (!chartData.length) return [];
    return chartData
      .map(item => ({ key: item.monthKey, name: item.month }))
      .sort((a, b) => b.key.localeCompare(a.key)); // Sort descending (newest first)
  }, [chartData]);

  // Get selected month data
  const selectedMonthData = useMemo(() => {
    return chartData.find(item => item.monthKey === selectedMonth) || {
      month: format(parseISO(selectedMonth + "-01"), "MMM yyyy"),
      monthKey: selectedMonth,
      income: 0,
      expenses: 0,
      net: 0,
      isPositive: true,
    };
  }, [chartData, selectedMonth]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("dashboard.spendingOverview.title")}</CardTitle>
          <CardDescription>
            {t("dashboard.spendingOverview.description")}
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
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("dashboard.spendingOverview.title")}</CardTitle>
          <CardDescription>
            {t("dashboard.spendingOverview.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("dashboard.spendingOverview.loadFailed")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("dashboard.spendingOverview.title")}</CardTitle>
          <CardDescription>
            {t("dashboard.spendingOverview.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("dashboard.spendingOverview.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("dashboard.spendingOverview.title")}</CardTitle>
            <CardDescription>
              {t("dashboard.spendingOverview.description")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {availableMonths.length > 0 && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] h-7 text-xs">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.key} value={month.key}>
                      {month.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v: number | string) =>
                  formatMoney(Number(v), currency)
                }
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <ReferenceLine y={0} stroke="#666" />
              <Bar
                dataKey="income"
                fill="#4ade80"
                name="Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="#f87171"
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Monthly Summary */}
        {chartData.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Total Income
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {formatMoney(selectedMonthData.income, currency)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Total Expenses
                </p>
                <p className="text-lg font-semibold text-red-600">
                  {formatMoney(selectedMonthData.expenses, currency)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Net Result
                </p>
                <p className={`text-lg font-semibold ${
                  selectedMonthData.net >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatMoney(selectedMonthData.net, currency)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
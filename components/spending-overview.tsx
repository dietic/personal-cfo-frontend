"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAnalyticsDashboard, useSpendingTrends, useTransactions } from "@/lib/hooks";
import { Transaction } from "@/lib/types";
import { format, parseISO, startOfYear, addDays, isWithinInterval, startOfMonth, subMonths, isAfter } from "date-fns";
import { useExchangeRate } from "@/lib/hooks";
import { convertAmount, getCurrencySymbol, type SupportedCurrency } from "@/lib/exchange-rates";
import ExchangeRateNote from "@/components/exchange-rate-note";

export function SpendingOverview() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>("PEN");
  
  const { data: rate } = useExchangeRate();
  const { data: analytics, isLoading, error } = useAnalyticsDashboard();
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useSpendingTrends({ months: 12 });
  
  // Fetch all transactions for computing monthly and weekly with conversion
  const { data: allTransactions } = useTransactions({});

  // Monthly from transactions (last 12 months), converted
  const processMonthlyData = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) {
      // Fallback: map trendsData without conversion (best effort)
      if (!trendsData) return [] as Array<{ month: string; amount: number; fullMonth: string }>;
      return trendsData
        .map((item) => {
          const date = parseISO(item.month + "-01");
          const monthName = format(date, "MMM yyyy");
          return {
            month: monthName,
            amount: Math.abs(parseFloat(item.amount)),
            fullMonth: item.month,
          };
        })
        .sort((a, b) => a.fullMonth.localeCompare(b.fullMonth));
    }

    // Build last 12 months keys
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(startOfMonth(now), i);
      months.push(format(d, "yyyy-MM"));
    }

    const sums: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));

    for (const tx of allTransactions) {
      const d = parseISO(tx.transaction_date);
      const key = format(startOfMonth(d), "yyyy-MM");
      if (!sums.hasOwnProperty(key)) continue; // outside last 12 months
      const raw = Math.abs(parseFloat(tx.amount));
      const ccy = (tx.currency as SupportedCurrency) || "PEN";
      const converted = rate ? convertAmount(raw, ccy, selectedCurrency, rate) : raw;
      sums[key] += converted;
    }

    const result = months.map((key) => {
      const date = parseISO(key + "-01");
      return {
        month: format(date, "MMM yyyy"),
        amount: Math.round(sums[key] * 100) / 100,
        fullMonth: key,
      };
    });

    return result;
  }, [allTransactions, rate, selectedCurrency, trendsData]);

  // Weekly data - last 4 weeks, convert all tx to selected currency
  const processWeeklyData = useMemo(() => {
    if (!allTransactions) {
      return [] as Array<{ week: string; amount: number; weekNumber: number }>;
    }

    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const today = new Date();
    const daysSinceYearStart = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeekNumber = Math.floor(daysSinceYearStart / 7) + 1;

    const weeks: Array<{ week: string; amount: number; weekNumber: number }> = [];
    for (let i = 3; i >= 0; i--) {
      const weekNumber = currentWeekNumber - i;
      if (weekNumber < 1) continue;
      const weekStart = addDays(yearStart, (weekNumber - 1) * 7);
      const weekEnd = addDays(weekStart, 6);

      const weekSpending = allTransactions.reduce((sum: number, tx: Transaction) => {
        const txDate = parseISO(tx.transaction_date);
        const isInWeek = isWithinInterval(txDate, { start: weekStart, end: weekEnd });
        if (!isInWeek) return sum;
        const raw = Math.abs(parseFloat(tx.amount));
        const ccy = (tx.currency as SupportedCurrency) || "PEN";
        const converted = rate ? convertAmount(raw, ccy, selectedCurrency, rate) : raw;
        return sum + converted;
      }, 0);

      weeks.push({
        week: `W${weekNumber} (${format(weekStart, "MMM d")}-${format(weekEnd, "d")})`,
        amount: Math.round(weekSpending * 100) / 100,
        weekNumber,
      });
    }

    return weeks;
  }, [allTransactions, selectedCurrency, rate]);

  const symbol = getCurrencySymbol(selectedCurrency);

  // Loading and error handling for monthly view
  if (activeTab === "monthly") {
    if (trendsError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>Your monthly spending trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Failed to load monthly spending data
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (trendsLoading && (!allTransactions || allTransactions.length === 0)) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>Your monthly spending trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-1">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // Loading and error handling for weekly view  
  if (activeTab === "weekly") {
    if (error) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>Your weekly spending trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Failed to load weekly spending data
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isLoading && (!allTransactions || allTransactions.length === 0)) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>Your weekly spending trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex space-x-1">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-16" />
                </div>
              </div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  const renderChart = () => {
    if (activeTab === "monthly" && processMonthlyData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            No monthly spending data available
          </p>
        </div>
      );
    }

    if (activeTab === "weekly" && processWeeklyData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No weekly spending data available</p>
        </div>
      );
    }

    if (activeTab === "monthly") {
      return (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processMonthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={11}
                interval={0}
              />
              <YAxis
                fontSize={11}
                tickFormatter={(value) => `${symbol}${Number(value).toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => [
                  `${symbol}${Number(value).toLocaleString()}`,
                  "Spent",
                ]}
                labelStyle={{ color: "#000" }}
              />
              <Bar
                dataKey="amount"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
                minPointSize={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (activeTab === "weekly") {
      return (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processWeeklyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={11}
                interval={0}
              />
              <YAxis
                fontSize={11}
                tickFormatter={(value) => `${symbol}${Number(value).toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => [
                  `${symbol}${Number(value).toLocaleString()}`,
                  "Spent",
                ]}
                labelStyle={{ color: "#000" }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#8884d8", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Fallback (should not be reached with new tab structure)
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>
          Your monthly trends and weekly spending patterns
        </CardDescription>
        <ExchangeRateNote />
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
            
            {/* Currency toggle for both views */}
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedCurrency === "PEN" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCurrency("PEN")}
              >
                PEN
              </Button>
              <Button
                variant={selectedCurrency === "USD" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCurrency("USD")}
              >
                USD
              </Button>
            </div>
          </div>
          
          <TabsContent value="monthly" className="space-y-4">
            {renderChart()}
          </TabsContent>
          <TabsContent value="weekly" className="space-y-4">
            {renderChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

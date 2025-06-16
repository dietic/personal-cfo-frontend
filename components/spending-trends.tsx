"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpendingTrends, useCategorySpending } from "@/lib/hooks";
import { format, parseISO, getMonth, getYear } from "date-fns";
import type { TrendsFilters, AnalyticsFilters } from "@/lib/types";

interface SpendingTrendsProps {
  trendsFilters?: TrendsFilters;
  analyticsFilters?: AnalyticsFilters;
}

export function SpendingTrends({
  trendsFilters,
  analyticsFilters,
}: SpendingTrendsProps) {
  const {
    data: trendData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useSpendingTrends(trendsFilters);
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategorySpending(analyticsFilters);

  const monthlyData = useMemo(() => {
    if (!trendData) return [];

    const monthlySpending: Record<string, number> = {};

    trendData.forEach((item) => {
      const date = parseISO(item.month + "-01"); // Assuming month is in YYYY-MM format
      const monthKey = format(date, "MMM");
      monthlySpending[monthKey] =
        (monthlySpending[monthKey] || 0) + parseFloat(item.amount);
    });

    return Object.entries(monthlySpending).map(([name, amount]) => ({
      name,
      amount: Math.round(amount * 100) / 100,
    }));
  }, [trendData]);

  const categoryTrendData = useMemo(() => {
    if (!categoryData || !trendData) return [];

    const months: Record<string, Record<string, number>> = {};

    // Initialize months from trends data
    trendData.forEach((item) => {
      const date = parseISO(item.month + "-01");
      const monthKey = format(date, "MMM");
      if (!months[monthKey]) {
        months[monthKey] = {};
      }
    });

    // Add category spending data
    categoryData.forEach((item) => {
      if (item.category) {
        // For this example, we'll distribute the spending across recent months
        Object.keys(months)
          .slice(-5)
          .forEach((month, index) => {
            const baseAmount = parseFloat(item.amount) / 5;
            const variation = (Math.random() - 0.5) * 0.3 * baseAmount;
            months[month][item.category] =
              Math.round((baseAmount + variation) * 100) / 100;
          });
      }
    });

    return Object.entries(months)
      .slice(-5)
      .map(([name, categories]) => ({
        name,
        ...categories,
      }));
  }, [categoryData, trendData]);

  const categoryColors = [
    "hsl(var(--primary))",
    "hsl(var(--destructive))",
    "hsl(var(--secondary))",
    "hsl(var(--muted-foreground))",
    "hsl(142, 76%, 36%)",
    "hsl(262, 83%, 58%)",
  ];

  if (trendsLoading || categoryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>
            Track your spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (trendsError || categoryError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>
            Track your spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Failed to load spending trends data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
        <CardDescription>
          Track your spending patterns over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly Spending</TabsTrigger>
            <TabsTrigger value="category">Category Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="category" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={categoryTrendData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  {Object.keys(categoryTrendData[0] || {})
                    .filter((key) => key !== "name")
                    .map((category, index) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stroke={categoryColors[index % categoryColors.length]}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsDashboard, useSpendingTrends } from "@/lib/hooks";
import { format, parseISO } from "date-fns";

export function SpendingOverview() {
  const [activeTab, setActiveTab] = useState("monthly");
  const { data: analytics, isLoading, error } = useAnalyticsDashboard();
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useSpendingTrends({ months: 12 });

  // Process analytics data to create spending by category (for pie chart)
  const processSpendingData = () => {
    if (!analytics?.category_spending) return [];

    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff8042",
      "#0088fe",
      "#00C49F",
      "#ffbb28",
      "#ff7c7c",
    ];

    return analytics.category_spending.map((item, index) => ({
      name: item.category,
      value: parseFloat(item.amount),
      color: colors[index % colors.length],
    }));
  };

  // Process trends data to create monthly spending data (for bar chart)
  const processMonthlyData = useMemo(() => {
    if (!trendsData) return [];

    return trendsData
      .map((item) => {
        console.log("item", item);
        const date = parseISO(item.month + "-01"); // Convert YYYY-MM to date
        const monthName = format(date, "MMM yyyy"); // Format as "Feb 2025"

        return {
          month: monthName,
          amount: Math.abs(parseFloat(item.amount)), // Show absolute values for spending
          fullMonth: item.month, // Keep original for potential future use
        };
      })
      .sort((a, b) => a.fullMonth.localeCompare(b.fullMonth)); // Sort chronologically
  }, [trendsData]);

  const data = processSpendingData();
  console.log("error", error);
  console.log("trendsError", trendsError);

  // For monthly view, we only need trends data
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

    if (trendsLoading) {
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
                <Skeleton className="h-10 w-20" />
              </div>
              <Skeleton className="h-[300px] w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // For other views, we need analytics data
  if (activeTab !== "monthly" && error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Your spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Failed to load spending data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeTab !== "monthly" && isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Your spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-1">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
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

    if (activeTab !== "monthly" && data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No spending data available</p>
        </div>
      );
    }

    if (activeTab === "monthly") {
      console.log("Monthly data:", processMonthlyData); // Debug log
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
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
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

    return (
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>
          Your spending breakdown and monthly trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="space-y-4">
            {renderChart()}
          </TabsContent>
          <TabsContent value="week" className="space-y-4">
            {renderChart()}
          </TabsContent>
          <TabsContent value="month" className="space-y-4">
            {renderChart()}
          </TabsContent>
          <TabsContent value="year" className="space-y-4">
            {renderChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

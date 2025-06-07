"use client";

import { useState } from "react";
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
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsDashboard } from "@/lib/hooks";

export function SpendingOverview() {
  const [activeTab, setActiveTab] = useState("month");
  const { data: analytics, isLoading, error } = useAnalyticsDashboard();

  // Process analytics data to create spending by category
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

  const data = processSpendingData();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Your spending breakdown by category</CardDescription>
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>Your spending breakdown by category</CardDescription>
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
    if (data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No spending data available</p>
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
        <CardDescription>Your spending breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
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

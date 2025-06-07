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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpendingTrends } from "@/lib/hooks";
import { format, parseISO, getYear, getMonth } from "date-fns";

export function MonthlyComparison() {
  const { data: trendData, isLoading, error } = useSpendingTrends();

  const comparisonData = useMemo(() => {
    if (!trendData) return [];

    const yearlyData: Record<number, Record<string, number>> = {};

    // Group spending by year and month
    trendData.forEach((item) => {
      const date = parseISO(item.month + "-01"); // Assuming month is in YYYY-MM format
      const year = getYear(date);
      const monthName = format(date, "MMM");

      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }

      yearlyData[year][monthName] =
        (yearlyData[year][monthName] || 0) + parseFloat(item.amount);
    });

    // Get the last two years with data
    const years = Object.keys(yearlyData).map(Number).sort().slice(-2);
    if (years.length < 2) {
      // If we don't have two years, create comparison with current year only
      const currentYear = years[0] || new Date().getFullYear();
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      return months.slice(0, 6).map((month) => ({
        name: month,
        [currentYear.toString()]:
          Math.round((yearlyData[currentYear]?.[month] || 0) * 100) / 100,
      }));
    }

    // Create comparison data for the last two years
    const [prevYear, currentYear] = years;
    const months = Object.keys(yearlyData[currentYear] || {}).slice(0, 6);

    return months.map((month) => ({
      name: month,
      [prevYear.toString()]:
        Math.round((yearlyData[prevYear]?.[month] || 0) * 100) / 100,
      [currentYear.toString()]:
        Math.round((yearlyData[currentYear]?.[month] || 0) * 100) / 100,
    }));
  }, [trendData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>Compare spending with previous year</CardDescription>
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
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>Compare spending with previous year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Failed to load comparison data
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the years for the legend
  const years =
    comparisonData.length > 0
      ? Object.keys(comparisonData[0]).filter((key) => key !== "name")
      : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Comparison</CardTitle>
        <CardDescription>Compare spending with previous year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
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
              {years.map((year, index) => (
                <Bar
                  key={year}
                  dataKey={year}
                  fill={
                    index === 0
                      ? "hsl(var(--muted-foreground))"
                      : "hsl(var(--primary))"
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

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
import { format, parseISO, startOfYear, addDays, isWithinInterval } from "date-fns";

export function SpendingOverview() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedCurrency, setSelectedCurrency] = useState<"PEN" | "USD">("PEN"); // Currency toggle for weekly view
  
  const { data: analytics, isLoading, error } = useAnalyticsDashboard();
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useSpendingTrends({ months: 12 });
  
  // Fetch all transactions for weekly processing
  const { data: allTransactions } = useTransactions({});

  // We can remove the old pie chart data processing since we only use Monthly and Weekly now
  const data = []; // Keeping for compatibility, but not used anymore

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

  // Process weekly data - last 4 weeks based on current date, but week numbering starts from Jan 1st
  const processWeeklyData = useMemo(() => {
    if (!allTransactions) {
      console.log("No allTransactions data available");
      return [];
    }

    console.log("All transactions:", allTransactions.length);
    console.log("Selected currency:", selectedCurrency);
    
    // Debug: Show currency distribution
    const currencyDistribution = allTransactions.reduce((acc: Record<string, number>, t: Transaction) => {
      acc[t.currency] = (acc[t.currency] || 0) + 1;
      return acc;
    }, {});
    console.log("Currency distribution:", currencyDistribution);
    
    // Debug: Check first few transactions
    console.log("Sample transactions:", allTransactions.slice(0, 5).map(t => ({
      id: t.id,
      date: t.transaction_date,
      amount: t.amount,
      currency: t.currency,
      merchant: t.merchant
    })));

    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1)); // January 1st of current year
    const today = new Date();
    
    // Calculate which week we're currently in (starting from Jan 1st)
    const daysSinceYearStart = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeekNumber = Math.floor(daysSinceYearStart / 7) + 1; // +1 because weeks start at 1, not 0
    
    console.log("Current week number:", currentWeekNumber);
    console.log("Year start:", yearStart);
    console.log("Today:", today);
    
    // Debug: Show what weeks we're calculating
    console.log("Will calculate weeks:", Array.from({length: 4}, (_, i) => currentWeekNumber - (3 - i)).filter(w => w >= 1));
    
    // Generate the last 4 weeks (including current week)
    const weeks = [];
    for (let i = 3; i >= 0; i--) { // Start from 3 weeks ago to current week
      const weekNumber = currentWeekNumber - i;
      
      // Skip if week number is less than 1 (shouldn't happen in normal cases)
      if (weekNumber < 1) continue;
      
      // Calculate week start and end dates
      const weekStart = addDays(yearStart, (weekNumber - 1) * 7);
      const weekEnd = addDays(weekStart, 6);
      
      console.log(`Week ${weekNumber}: ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`);
      
      // Filter transactions for this week and selected currency
      const weekTransactions = allTransactions.filter((transaction: Transaction) => {
        const transactionDate = parseISO(transaction.transaction_date);
        const isInWeek = isWithinInterval(transactionDate, {
          start: weekStart,
          end: weekEnd
        });
        const isCorrectCurrency = transaction.currency === selectedCurrency;
        
        // Accept both positive and negative amounts (expenses can be stored either way)
        const hasAmount = parseFloat(transaction.amount) !== 0;
        
        return isInWeek && isCorrectCurrency && hasAmount;
      });
      
      console.log(`Week ${weekNumber} (${format(weekStart, "MMM d")}-${format(weekEnd, "MMM d")}) transactions:`, {
        count: weekTransactions.length,
        currency: selectedCurrency,
        transactions: weekTransactions.map(t => ({
          id: t.id,
          date: t.transaction_date,
          amount: t.amount,
          currency: t.currency,
          merchant: t.merchant,
          parsedAmount: parseFloat(t.amount),
          absoluteAmount: Math.abs(parseFloat(t.amount))
        }))
      });
      
      // Sum up spending for this week (take absolute value to ensure positive display)
      const weekSpending = weekTransactions.reduce((sum: number, transaction: Transaction) => {
        const amount = Math.abs(parseFloat(transaction.amount));
        console.log(`Adding transaction ${transaction.id}: ${transaction.merchant} = ${amount}`);
        return sum + amount;
      }, 0);
      
      console.log(`Week ${weekNumber} total spending: ${weekSpending}`);
      
      weeks.push({
        week: `W${weekNumber} (${format(weekStart, "MMM d")}-${format(weekEnd, "d")})`, // e.g., "W6 (Feb 5-11)"
        amount: weekSpending,
        weekNumber: weekNumber
      });
    }
    
    return weeks;
  }, [allTransactions, selectedCurrency]);

  console.log("error", error);
  console.log("trendsError", trendsError);

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

    if (isLoading) {
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

    if (activeTab === "weekly") {
      const currencySymbol = selectedCurrency === "PEN" ? "S/" : "$";
      console.log("Weekly data:", processWeeklyData); // Debug log
      
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
                tickFormatter={(value) => `${currencySymbol}${Number(value).toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => [
                  `${currencySymbol}${Number(value).toLocaleString()}`,
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
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
            
            {/* Currency toggle - only show for weekly view */}
            {activeTab === "weekly" && (
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
            )}
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

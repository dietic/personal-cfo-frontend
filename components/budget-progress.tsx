"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudgets, useCategorySpending } from "@/lib/hooks";
import { format } from "date-fns";

// Currency formatting function
const formatCurrency = (amount: number, currency: string) => {
  const formattedAmount = amount.toFixed(2);
  const currencySymbol =
    currency === "USD"
      ? "$"
      : currency === "PEN"
      ? "S/"
      : currency === "EUR"
      ? "€"
      : currency === "GBP"
      ? "£"
      : currency + " ";
  return `${currencySymbol}${formattedAmount}`;
};

export function BudgetProgress() {
  const {
    data: budgets,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useBudgets();

  // We need to get spending data for each budget's currency separately
  // For now, we'll get all category spending and filter client-side
  // In a future optimization, we could make separate API calls per currency
  const { data: categorySpending, isLoading: spendingLoading } =
    useCategorySpending({
      start_date: format(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        "yyyy-MM-dd"
      ),
      end_date: format(new Date(), "yyyy-MM-dd"),
      // Note: Not filtering by currency here to get all spending data
    });

  const isLoading = budgetsLoading || spendingLoading;

  // Process budget data with current spending, filtered by currency
  const processedBudgets =
    budgets?.map((budget) => {
      // Find spending for this budget's category AND currency
      const matchingSpending = categorySpending?.find(
        (spending) =>
          spending.category.toLowerCase() === budget.category.toLowerCase() &&
          spending.currency === budget.currency
      );
      
      const spent = matchingSpending ? parseFloat(matchingSpending.amount) : 0;
      const limitAmount = parseFloat(budget.limit_amount);
      const percentage =
        limitAmount > 0 ? Math.round((spent / limitAmount) * 100) : 0;

      return {
        name: budget.category,
        spent,
        budget: limitAmount,
        percentage,
        currency: budget.currency,
        id: budget.id,
      };
    }) || [];

  if (budgetsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Your monthly budget utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load budget data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Your monthly budget utilization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Your monthly budget utilization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {processedBudgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No budgets set for this month
            </p>
          </div>
        ) : (
          processedBudgets.map((category) => (
            <div key={category.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{category.name}</span>
                <span className="font-medium">
                  {formatCurrency(category.spent, category.currency)} / {formatCurrency(category.budget, category.currency)}
                </span>
              </div>
              <Progress
                value={category.percentage}
                max={150}
                className={`h-2 ${
                  category.percentage > 100
                    ? "bg-red-100"
                    : category.percentage > 80
                    ? "bg-amber-100"
                    : ""
                }`}
                indicatorClassName={`${
                  category.percentage > 100
                    ? "bg-destructive"
                    : category.percentage > 80
                    ? "bg-amber-500"
                    : "bg-primary"
                }`}
              />
              <p className="text-xs text-muted-foreground">
                {category.percentage > 100
                  ? `${category.percentage - 100}% over budget`
                  : `${100 - category.percentage}% remaining`}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

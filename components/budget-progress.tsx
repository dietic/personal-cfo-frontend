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

export function BudgetProgress() {
  const {
    data: budgets,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useBudgets();
  const { data: categorySpending, isLoading: spendingLoading } =
    useCategorySpending({
      start_date: format(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        "yyyy-MM-dd"
      ),
      end_date: format(new Date(), "yyyy-MM-dd"),
    });

  const isLoading = budgetsLoading || spendingLoading;

  // Create a map of category spending for current month
  const spendingMap =
    categorySpending?.reduce((acc, item) => {
      acc[item.category.toLowerCase()] = parseFloat(item.amount);
      return acc;
    }, {} as Record<string, number>) || {};

  // Process budget data with current spending
  const processedBudgets =
    budgets?.map((budget) => {
      const spent = spendingMap[budget.category.toLowerCase()] || 0;
      const limitAmount = parseFloat(budget.limit_amount);
      const percentage =
        limitAmount > 0 ? Math.round((spent / limitAmount) * 100) : 0;

      return {
        name: budget.category,
        spent,
        budget: limitAmount,
        percentage,
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
                  ${category.spent.toLocaleString()} / $
                  {category.budget.toLocaleString()}
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

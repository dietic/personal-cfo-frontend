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
import {
  getCurrencySymbol,
  type SupportedCurrency,
} from "@/lib/exchange-rates";
import { useBudgets, useCategorySpending } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { Budget, CategorySpending } from "@/lib/types";
import { format } from "date-fns";

interface ProcessedBudget {
  name: string;
  spent: number;
  budget: number;
  percentage: number;
  currency: string;
  id: string;
}

// Currency formatting function
const formatCurrency = (amount: number, currency: SupportedCurrency) => {
  const formattedAmount = amount.toFixed(2);
  const currencySymbol = getCurrencySymbol(currency);
  return `${currencySymbol}${formattedAmount}`;
};

export function BudgetProgress() {
  const { t } = useI18n();
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
  const processedBudgets: ProcessedBudget[] =
    (budgets as Budget[] | undefined)?.map((budget: Budget) => {
      // Find spending for this budget's category AND currency
      const matchingSpending = (
        categorySpending as CategorySpending[] | undefined
      )?.find(
        (spending: CategorySpending) =>
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
          <CardTitle>{t("budgetProgress.title")}</CardTitle>
          <CardDescription>{t("budgetProgress.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("budgetProgress.failed")}
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
          <CardTitle>{t("budgetProgress.title")}</CardTitle>
          <CardDescription>{t("budgetProgress.description")}</CardDescription>
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
        <CardTitle>{t("budgetProgress.title")}</CardTitle>
        <CardDescription>{t("budgetProgress.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {processedBudgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("budgetProgress.none")}</p>
          </div>
        ) : (
          processedBudgets.map((category: ProcessedBudget) => (
            <div key={category.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{category.name}</span>
                <span className="font-medium">
                  {formatCurrency(
                    category.spent,
                    category.currency as SupportedCurrency
                  )}{" "}
                  /{" "}
                  {formatCurrency(
                    category.budget,
                    category.currency as SupportedCurrency
                  )}
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
                  ? t("budgetProgress.overBudget", {
                      percent: category.percentage - 100,
                    })
                  : t("budgetProgress.remaining", {
                      percent: 100 - category.percentage,
                    })}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

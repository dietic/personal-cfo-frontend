"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { useBudgetAlerts, useCards, useRecurringServices } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

export function Alerts() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t, locale } = useI18n();

  const {
    data: budgetAlerts,
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useBudgetAlerts();
  const {
    data: cards,
    isLoading: cardsLoading,
    refetch: refetchCards,
  } = useCards();
  const {
    data: recurringServices,
    isLoading: servicesLoading,
    refetch: refetchServices,
  } = useRecurringServices();

  const isLoading = alertsLoading || cardsLoading || servicesLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchAlerts(), refetchCards(), refetchServices()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Process budget alerts
  const processedAlerts =
    budgetAlerts?.map((alert) => ({
      id: `budget-${alert.budget.id}`,
      type:
        alert.percentage_used > 100
          ? "warning"
          : alert.percentage_used > 80
          ? "info"
          : "info",
      title: t("alerts.budget.title", { category: alert.budget.category }),
      description: t("alerts.budget.description", {
        percent: alert.percentage_used.toFixed(0),
        category: alert.budget.category,
        current: formatMoney(
          Number(alert.current_spending),
          alert.budget.currency,
          locale === "es" ? "es-PE" : "en-US"
        ),
        limit: formatMoney(
          Number(alert.budget.limit_amount),
          alert.budget.currency,
          locale === "es" ? "es-PE" : "en-US"
        ),
      }),
      icon: DollarSign,
    })) || [];

  // Process payment due alerts (cards with payment due dates)
  const paymentAlerts =
    cards
      ?.filter((card) => card.payment_due_date)
      .map((card) => {
        // Convert the stored date to a recurring monthly due date
        // Example: If stored date is "2025-05-20", we extract day "20"
        // and calculate the 20th of the current/next month
        const storedDate = parseISO(card.payment_due_date!);
        const dueDayOfMonth = storedDate.getDate(); // Get the day (e.g., 20 for 20th)

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Calculate the next due date (this month or next month)
        let nextDueDate = new Date(currentYear, currentMonth, dueDayOfMonth);

        // If the due date for this month has already passed, use next month
        if (nextDueDate < today) {
          nextDueDate = new Date(currentYear, currentMonth + 1, dueDayOfMonth);
        }

        // Calculate days remaining (using floor for accurate day counting)
        const daysUntilDue = Math.floor(
          (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Show alert 5 days before due date (as requested)
        if (daysUntilDue <= 5 && daysUntilDue >= 0) {
          const when =
            daysUntilDue === 0
              ? t("alerts.cardDue.today")
              : daysUntilDue === 1
              ? t("alerts.cardDue.tomorrow")
              : t("alerts.cardDue.inDays", { days: daysUntilDue });
          return {
            id: `payment-${card.id}`,
            type: daysUntilDue <= 2 ? "warning" : "info",
            title: t("alerts.cardDue.title"),
            description: t("alerts.cardDue.description", {
              name: card.card_name,
              when,
              date: format(nextDueDate, "MMM dd"),
            }),
            icon: Calendar,
          };
        }
        return null;
      })
      .filter(Boolean) || [];

  // Process recurring services payment alerts
  const recurringServiceAlerts =
    recurringServices
      ?.map((service) => {
        const dueDate = parseISO(service.due_date);
        const today = new Date();
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if we should show alert based on reminder_days setting (default to 3 if not set)
        const reminderDays = service.reminder_days || 3;
        if (daysUntilDue <= reminderDays && daysUntilDue >= 0) {
          const when =
            daysUntilDue === 0
              ? t("alerts.cardDue.today")
              : daysUntilDue === 1
              ? t("alerts.cardDue.tomorrow")
              : t("alerts.cardDue.inDays", { days: daysUntilDue });
          return {
            id: `recurring-${service.id}`,
            type: daysUntilDue <= 3 ? "warning" : "info",
            title: t("alerts.recurring.title"),
            description: t("alerts.recurring.description", {
              name: service.name,
              when,
              amount: service.amount,
            }),
            icon: Calendar,
          };
        }
        return null;
      })
      .filter(Boolean) || [];

  // Combine all alerts
  const allAlerts = [
    ...processedAlerts,
    ...paymentAlerts,
    ...recurringServiceAlerts,
  ];

  if (alertsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("alerts.title")}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("alerts.noAlerts")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("alerts.title")}
            </div>
            <Button variant="outline" size="icon" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t("alerts.title")}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allAlerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("alerts.noAlerts")}</p>
          </div>
        ) : (
          allAlerts.map(
            (alert) =>
              alert && (
                <Alert
                  key={alert.id}
                  variant={alert.type === "warning" ? "destructive" : "default"}
                >
                  <alert.icon className="h-4 w-4" />
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              )
          )
        )}
      </CardContent>
    </Card>
  );
}

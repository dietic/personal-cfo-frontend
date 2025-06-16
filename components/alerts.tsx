"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudgetAlerts, useCards, useRecurringServices } from "@/lib/hooks";
import { format, addDays, parseISO } from "date-fns";
import { useState } from "react";

export function Alerts() {
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      title: `Budget Alert: ${alert.budget.category}`,
      description: `You've spent ${alert.percentage_used.toFixed(0)}% of your ${
        alert.budget.category
      } budget (${alert.current_spending} / ${alert.budget.limit_amount})`,
      icon: DollarSign,
    })) || [];

  // Process payment due alerts (cards with payment due dates)
  const paymentAlerts =
    cards
      ?.filter((card) => card.payment_due_date)
      .map((card) => {
        const dueDate = parseISO(card.payment_due_date!);
        const today = new Date();
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue <= 7 && daysUntilDue >= 0) {
          return {
            id: `payment-${card.id}`,
            type: daysUntilDue <= 3 ? "warning" : "info",
            title: "Payment Due Soon",
            description: `${card.card_name} payment due ${
              daysUntilDue === 0
                ? "today"
                : daysUntilDue === 1
                ? "tomorrow"
                : `in ${daysUntilDue} days`
            }`,
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
          return {
            id: `recurring-${service.id}`,
            type: daysUntilDue <= 3 ? "warning" : "info",
            title: "Recurring Service Payment Due",
            description: `${service.name} payment due ${
              daysUntilDue === 0
                ? "today"
                : daysUntilDue === 1
                ? "tomorrow"
                : `in ${daysUntilDue} days`
            } ($${service.amount})`,
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
              Alerts
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
            <p className="text-muted-foreground">No alerts at this time</p>
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
              Alerts
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
            Alerts
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
            <p className="text-muted-foreground">No alerts at this time</p>
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

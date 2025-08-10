"use client";

import { AddCardDialog } from "@/components/add-card-dialog";
import { CreditCard } from "@/components/credit-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCards } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useBrandedCards } from "@/lib/settings-context";
import { Card as BackendCard } from "@/lib/types";
import { CreditCardIcon, Plus } from "lucide-react";

// Transform backend card to frontend card format with conditional bank provider colors
function transformCard(backendCard: BackendCard, useBrandedColors: boolean) {
  // Generate theme-aware Tailwind classes for bank colors - like a smart palette that adapts to lighting
  const getCardGradient = () => {
    const bankProvider = backendCard.bank_provider;

    // If branded cards are disabled, always use the generic gradient - like a "uniform mode"
    if (!useBrandedColors) {
      return "from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700"; // Generic gradient that adapts to theme
    }

    // If branded cards are enabled, use authentic bank colors with theme support
    if (bankProvider?.color_primary && bankProvider?.color_secondary) {
      // Map bank colors to Tailwind classes that support light/dark themes
      const bankColorMap: Record<string, string> = {
        // BCP: Deep blue to orange
        bcp: "from-blue-900 to-orange-600 dark:from-blue-800 dark:to-orange-500",
        // Interbank: Green gradient
        interbank:
          "from-green-700 to-green-500 dark:from-green-600 dark:to-green-400",
        // BBVA: Blue gradient
        "bbva continental":
          "from-blue-800 to-blue-600 dark:from-blue-700 dark:to-blue-500",
        // Scotiabank: Red gradient
        scotiabank: "from-red-700 to-red-500 dark:from-red-600 dark:to-red-400",
        // Diners: Navy to light blue
        diners: "from-blue-900 to-blue-500 dark:from-blue-800 dark:to-blue-400",
      };

      const bankKey = bankProvider.short_name?.toLowerCase() || "";
      if (bankColorMap[bankKey]) {
        return bankColorMap[bankKey];
      }
    }

    // Fallback to default color scheme
    return "from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700";
  };

  return {
    id: backendCard.id,
    name: backendCard.card_name,
    type: "Credit Card", // Simplified since we removed card types
    lastFour: "****", // Backend doesn't provide this
    balance: 0, // Backend doesn't provide balance directly
    limit: 5000, // Default limit, could be added to backend
    dueDate: backendCard.payment_due_date || undefined,
    utilization: 0, // Would need to calculate from transactions
    alerts: [], // Would need to implement alerts logic
    network: "visa" as const, // Default network since we removed network providers
    color: getCardGradient(),
    bankProvider: useBrandedColors ? backendCard.bank_provider : null, // Only show bank info if branded mode is on
  };
}

export function CardsDashboard() {
  const { data: backendCards, isLoading, error } = useCards();
  const useBrandedColors = useBrandedCards(); // Get the user preference
  const { t } = useI18n();

  // Transform cards with the user's color preference
  const cards =
    backendCards?.map((card) => transformCard(card, useBrandedColors)) || [];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            {t("cards.overview.title")}
          </CardTitle>
          <CardDescription>{t("cards.overview.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("cards.loadFailed")}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t("cards.retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-primary" />
              {t("cards.overview.title")}
            </CardTitle>
            <CardDescription>{t("cards.overview.description")}</CardDescription>
          </div>
          {cards && cards.length > 0 && (
            <AddCardDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("cards.addCard")}
              </Button>
            </AddCardDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,400px))] gap-6 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : cards && cards.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,400px))] gap-6 justify-start">
            {cards.map((card) => (
              <div key={card.id} className="w-full">
                <CreditCard card={card} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t("cards.noCards")}</p>
            <AddCardDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("cards.addCard")}
              </Button>
            </AddCardDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

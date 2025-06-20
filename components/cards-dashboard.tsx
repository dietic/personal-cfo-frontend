"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCardIcon, Plus } from "lucide-react";
import { CreditCard } from "@/components/credit-card";
import { Button } from "@/components/ui/button";
import { useCards } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Card as BackendCard } from "@/lib/types";
import { AddCardDialog } from "@/components/add-card-dialog";
import { useBrandedCards } from "@/lib/settings-context";

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
        "bcp": "from-blue-900 to-orange-600 dark:from-blue-800 dark:to-orange-500",
        // Interbank: Green gradient
        "interbank": "from-green-700 to-green-500 dark:from-green-600 dark:to-green-400", 
        // BBVA: Blue gradient
        "bbva continental": "from-blue-800 to-blue-600 dark:from-blue-700 dark:to-blue-500",
        // Scotiabank: Red gradient
        "scotiabank": "from-red-700 to-red-500 dark:from-red-600 dark:to-red-400",
        // Diners: Navy to light blue
        "diners": "from-blue-900 to-blue-500 dark:from-blue-800 dark:to-blue-400",
      };
      
      const bankKey = bankProvider.short_name?.toLowerCase() || '';
      if (bankColorMap[bankKey]) {
        return bankColorMap[bankKey];
      }
    }
    
    // Fallback to network-based colors with proper light/dark theme support
    switch (backendCard.network_provider?.toLowerCase()) {
      case "visa":
        return "from-blue-600 to-blue-900 dark:from-blue-500 dark:to-blue-800";
      case "mastercard":
        return "from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500";
      case "amex":
        return "from-emerald-500 to-teal-700 dark:from-emerald-400 dark:to-teal-600";
      case "discover":
        return "from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500";
      default:
        return "from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700";
    }
  };

  return {
    id: backendCard.id,
    name: backendCard.card_name,
    type: backendCard.card_type || "Credit Card",
    lastFour: "****", // Backend doesn't provide this
    balance: 0, // Backend doesn't provide balance directly
    limit: 5000, // Default limit, could be added to backend
    dueDate: backendCard.payment_due_date || undefined,
    utilization: 0, // Would need to calculate from transactions
    alerts: [], // Would need to implement alerts logic
    network:
      (backendCard.network_provider?.toLowerCase() as
        | "visa"
        | "mastercard"
        | "amex"
        | "discover") || "visa",
    color: getCardGradient(),
    bankProvider: useBrandedColors ? backendCard.bank_provider : null, // Only show bank info if branded mode is on
  };
}

export function CardsDashboard() {
  const { data: backendCards, isLoading, error } = useCards();
  const useBrandedColors = useBrandedCards(); // Get the user preference

  // Transform cards with the user's color preference
  const cards = backendCards?.map(card => transformCard(card, useBrandedColors)) || [];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            Cards Overview
          </CardTitle>
          <CardDescription>
            Manage your cards and track balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load cards</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
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
              Cards Overview
            </CardTitle>
            <CardDescription>
              Manage your cards and track balances
            </CardDescription>
          </div>
          {cards && cards.length > 0 && (
            <AddCardDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </AddCardDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : cards && cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CreditCard key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No cards found</p>
            <AddCardDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </AddCardDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

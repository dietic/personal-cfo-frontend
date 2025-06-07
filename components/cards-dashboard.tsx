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

// Transform backend card to frontend card format
function transformCard(backendCard: BackendCard) {
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
    color: "from-blue-600 to-indigo-800 dark:from-blue-500 dark:to-indigo-700", // Default color
  };
}

export function CardsDashboard() {
  const { data: backendCards, isLoading, error } = useCards();

  const cards = backendCards?.map(transformCard) || [];

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

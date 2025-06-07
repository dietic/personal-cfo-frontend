"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCardIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard } from "@/components/credit-card";
import { useCards } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Card as BackendCard } from "@/lib/types";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardDialog } from "@/components/delete-card-dialog";

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

export function CardsList() {
  const { data: backendCards, isLoading, error } = useCards();

  const cards = backendCards?.map(transformCard) || [];

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load cards</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cards found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first card
            </p>
            <AddCardDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </AddCardDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => {
        // Find the original backend card for the dialogs
        const backendCard = backendCards?.find((bc) => bc.id === card.id);

        return (
          <Card key={card.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  {card.name}
                </CardTitle>
                <CardDescription>
                  {card.type} •••• {card.lastFour}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Card options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {backendCard && (
                    <EditCardDialog card={backendCard}>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Card
                      </DropdownMenuItem>
                    </EditCardDialog>
                  )}
                  {backendCard && (
                    <DeleteCardDialog card={backendCard}>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Card
                      </DropdownMenuItem>
                    </DeleteCardDialog>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <CreditCard card={card} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Transactions
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

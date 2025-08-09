"use client";

import { AddCardDialog } from "@/components/add-card-dialog";
import { CreditCard } from "@/components/credit-card";
import { DeleteCardDialog } from "@/components/delete-card-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCards } from "@/lib/hooks";
import { useBrandedCards } from "@/lib/settings-context";
import { Card as BackendCard } from "@/lib/types";
import {
  CreditCardIcon,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Transform backend card to frontend card format with conditional bank provider colors
function transformCard(backendCard: BackendCard, useBrandedColors: boolean) {
  // Generate theme-aware Tailwind classes for bank colors - respecting user's branded cards preference
  const getCardGradient = () => {
    const bankProvider = backendCard.bank_provider;

    // If branded cards are disabled, always use the generic gradient
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
    return "linear-gradient(135deg, #374151 0%, #1f2937 100%)"; // Default gray gradient
  };

  return {
    id: backendCard.id,
    name: backendCard.card_name,
    type: "Credit Card", // Simplified since we removed card types
    lastFour: "****", // Simple identifier, not critical for expense tracking
    balance: 0, // Backend doesn't provide balance directly - would need to calculate from transactions
    limit: 5000, // Default limit - could be added to backend later
    dueDate: backendCard.payment_due_date || undefined,
    utilization: 0, // Would need to calculate from transactions
    alerts: [], // For future alerts implementation
    network: "visa" as const, // Default network since we removed network providers
    color: getCardGradient(),
    bankProvider: backendCard.bank_provider, // Pass bank provider data
  };
}

export function CardsList() {
  const { data: backendCards, isLoading, error } = useCards();
  const router = useRouter();
  const brandedCards = useBrandedCards(); // Get the user's branded cards preference

  const cards =
    backendCards?.map((card) => transformCard(card, brandedCards)) || [];

  // Handle navigation to transactions with card filter
  const handleViewTransactions = (cardId: string, cardName: string) => {
    // Navigate to transactions page with card filter pre-applied
    const searchParams = new URLSearchParams({
      card_id: cardId,
      card_name: cardName, // Include card name for better UX
    });
    router.push(`/transactions?${searchParams.toString()}`);
  };

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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,400px))] gap-6 justify-center">
      {cards.map((card) => {
        // Find the original backend card for the dialogs
        const backendCard = backendCards?.find((bc) => bc.id === card.id);

        return (
          <Card key={card.id} className="overflow-hidden w-full">
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
                        className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400 hover:text-red-600 focus:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  handleViewTransactions(card.id.toString(), card.name)
                }
              >
                View Transactions
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

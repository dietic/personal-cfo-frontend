"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTransactions, useCards } from "@/lib/hooks";
import { format, parseISO } from "date-fns";

export function RecentTransactions() {
  const { data: transactions, isLoading, error } = useTransactions();
  const { data: cards } = useCards();

  // Create a map of card IDs to card names for display
  const cardMap =
    cards?.reduce((acc, card) => {
      acc[card.id] = card.card_name;
      return acc;
    }, {} as Record<string, string>) || {};

  // Get the 5 most recent transactions
  const recentTransactions = transactions?.slice(0, 5) || [];

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getInitials = (merchant: string) => {
    return merchant
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to get badge color based on category
  const getBadgeVariant = (category?: string | null) => {
    if (!category) return "secondary";

    switch (category.toLowerCase()) {
      case "groceries":
        return "default";
      case "entertainment":
        return "secondary";
      case "transportation":
      case "transport":
        return "outline";
      case "shopping":
        return "destructive";
      case "food":
      case "dining":
        return "default";
      default:
        return "secondary";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load transactions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest spending activity</CardDescription>
          </div>
          <Skeleton className="h-9 w-20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/transactions">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(transaction.merchant)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{transaction.merchant}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(transaction.transaction_date)}</span>
                      <span>•</span>
                      <span>
                        {cardMap[transaction.card_id] || "Unknown Card"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getBadgeVariant(transaction.category)}>
                    {transaction.category || "Uncategorized"}
                  </Badge>
                  <div className="text-right">
                    <span className="font-medium">
                      -
                      {transaction.currency === "USD"
                        ? "$"
                        : transaction.currency === "PEN"
                        ? "S/"
                        : transaction.currency + " "}
                      {parseFloat(transaction.amount).toFixed(2)}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {transaction.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

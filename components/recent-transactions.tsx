"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatDate as intlFormatDate } from "@/lib/format";
import { useCards, useCategoryColors, useTransactions } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { isValid, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function RecentTransactions() {
  const { t, locale } = useI18n();
  const { data: transactions, isLoading, error } = useTransactions();
  const { data: cards } = useCards();
  const { getCategoryBadgeStyle } = useCategoryColors();

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
      const d = parseISO(dateString);
      if (!isValid(d)) return dateString;
      return intlFormatDate(d, locale);
    } catch {
      return dateString;
    }
  };

  const getInitials = (merchant: string) => {
    const safe = (merchant || "?").trim();
    return safe
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("transactions.recent.title")}</CardTitle>
          <CardDescription>{t("transactions.recent.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("transactions.loadFailed")}
            </p>
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
            <CardTitle>{t("transactions.recent.title")}</CardTitle>
            <CardDescription>
              {t("transactions.recent.subtitle")}
            </CardDescription>
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
          <CardTitle>{t("transactions.recent.title")}</CardTitle>
          <CardDescription>{t("transactions.recent.subtitle")}</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/transactions">
            {t("transactions.all.title")}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("transactions.empty")}</p>
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
                    <p className="font-medium">
                      {transaction.description &&
                      transaction.description !== transaction.merchant
                        ? transaction.description
                        : transaction.merchant}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {transaction.description &&
                        transaction.description !== transaction.merchant &&
                        transaction.merchant && (
                          <>
                            <span>{transaction.merchant}</span>
                            <span>•</span>
                          </>
                        )}
                      <span>{formatDate(transaction.transaction_date)}</span>
                      <span>•</span>
                      <span>
                        {cardMap[transaction.card_id] ||
                          t("transactions.unknownCard")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    style={getCategoryBadgeStyle(transaction.category)}
                  >
                    {transaction.category || t("transactions.uncategorized")}
                  </Badge>
                  <div className="text-right">
                    <span className="font-medium">
                      -
                      {formatMoney(
                        Number(transaction.amount),
                        transaction.currency as any,
                        locale
                      )}
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

"use client";

import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import ExchangeRateNote from "@/components/exchange-rate-note";
import { ImportStatementDialog } from "@/components/import-statement-dialog";
import { PageHeader } from "@/components/page-header";
import { TransactionsFilter } from "@/components/transactions-filter";
import { TransactionsList } from "@/components/transactions-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tInstant, useI18n } from "@/lib/i18n";
import type { TransactionFilters } from "@/lib/types";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function TransactionsPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currency, setCurrency] = useState<string | undefined>(undefined);

  // Check for URL parameters on component mount
  useEffect(() => {
    const cardId = searchParams.get("card_id");
    const cardName = searchParams.get("card_name");

    if (cardId) {
      // Pre-populate filters with card filter from URL
      setFilters((prevFilters) => ({
        ...prevFilters,
        card_id: cardId,
      }));
    }
  }, [searchParams]);

  const handleFiltersChange = useCallback(
    (newFilters: TransactionFilters, selectedCurrency?: string) => {
      setFilters(newFilters);
      setCurrency(selectedCurrency);
    },
    []
  );

  // Handle clearing card filter
  const handleClearCardFilter = useCallback(() => {
    setFilters((prevFilters) => {
      const { card_id, ...otherFilters } = prevFilters;
      return otherFilters;
    });

    // Update URL to remove card filter parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("card_id");
    url.searchParams.delete("card_name");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Get card name from URL for display
  const cardName = searchParams.get("card_name");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("transactions.page.title")}
        description={t("transactions.page.description")}
        action={
          <div className="flex gap-2">
            <AddTransactionDialog />
            <ImportStatementDialog />
          </div>
        }
      />

      <ExchangeRateNote />

      {/* Show active card filter */}
      {filters.card_id && cardName && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("transactions.filteredByCard")}:
          </span>
          <Badge variant="secondary" className="gap-2">
            {cardName}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={handleClearCardFilter}
              aria-label={t("transactions.clearCardFilter")}
              title={t("transactions.clearCardFilter")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}

      <TransactionsFilter
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />
      <TransactionsList filters={filters} currency={currency} />
    </div>
  );
}

export default function TransactionsClient() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-muted-foreground">
          {tInstant("transactions.loading")}
        </div>
      }
    >
      <TransactionsPageContent />
    </Suspense>
  );
}

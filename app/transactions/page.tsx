"use client";

import React, { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionsList } from "@/components/transactions-list";
import { TransactionsFilter } from "@/components/transactions-filter";
import { ImportStatementDialog } from "@/components/import-statement-dialog";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransactionFilters } from "@/lib/types";

function TransactionsPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currency, setCurrency] = useState<string | undefined>(undefined);

  // Check for URL parameters on component mount
  useEffect(() => {
    const cardId = searchParams.get('card_id');
    const cardName = searchParams.get('card_name');
    
    if (cardId) {
      // Pre-populate filters with card filter from URL
      setFilters(prevFilters => ({
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
    setFilters(prevFilters => {
      const { card_id, ...otherFilters } = prevFilters;
      return otherFilters;
    });
    
    // Update URL to remove card filter parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('card_id');
    url.searchParams.delete('card_name');
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Get card name from URL for display
  const cardName = searchParams.get('card_name');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="View and manage your transactions"
        action={
          <div className="flex gap-2">
            <AddTransactionDialog />
            <ImportStatementDialog />
          </div>
        }
      />
      
      {/* Show active card filter */}
      {filters.card_id && cardName && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by card:</span>
          <Badge variant="secondary" className="gap-2">
            {cardName}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={handleClearCardFilter}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
      
      <TransactionsFilter onFiltersChange={handleFiltersChange} initialFilters={filters} />
      <TransactionsList filters={filters} currency={currency} />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading transactions...</div>}>
      <TransactionsPageContent />
    </Suspense>
  );
}

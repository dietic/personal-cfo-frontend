"use client";

import { useState, useCallback } from "react";
import { TransactionsList } from "@/components/transactions-list";
import { TransactionsFilter } from "@/components/transactions-filter";
import { ImportStatementDialog } from "@/components/import-statement-dialog";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { PageHeader } from "@/components/page-header";
import type { TransactionFilters } from "@/lib/types";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currency, setCurrency] = useState<string | undefined>(undefined);

  const handleFiltersChange = useCallback(
    (newFilters: TransactionFilters, selectedCurrency?: string) => {
      setFilters(newFilters);
      setCurrency(selectedCurrency);
    },
    []
  );

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
      <TransactionsFilter onFiltersChange={handleFiltersChange} />
      <TransactionsList filters={filters} currency={currency} />
    </div>
  );
}

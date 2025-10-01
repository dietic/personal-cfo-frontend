"use client";

import { PageHeader } from "@/components/page-header";
import { IncomesList } from "@/components/incomes-list";
import { AddTransactionUnifiedDialog } from "@/components/add-transaction-unified-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tInstant, useI18n } from "@/lib/i18n";
import type { IncomeFilters } from "@/lib/types";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

export default function IncomesClient() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<IncomeFilters>({});

  const handleFiltersChange = useCallback(
    (newFilters: IncomeFilters) => {
      setFilters(newFilters);
    },
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("incomes.page.title")}
        description={t("incomes.page.description")}
        action={
          <div className="flex gap-2">
            <AddTransactionUnifiedDialog defaultType="income" />
          </div>
        }
      />

      <IncomesList filters={filters} />
    </div>
  );
}
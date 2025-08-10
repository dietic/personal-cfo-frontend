"use client";

import { AnalyticsDateFilter } from "@/components/analytics-date-filter";
import ExchangeRateNote from "@/components/exchange-rate-note";
import { MonthlyComparison } from "@/components/monthly-comparison";
import { PageHeader } from "@/components/page-header";
import { SpendingByCategory } from "@/components/spending-by-category";
import { SpendingTrends } from "@/components/spending-trends";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters, TrendsFilters } from "@/lib/types";
import { useCallback, useState } from "react";

export default function AnalyticsClient() {
  const { t } = useI18n();
  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>(
    {}
  );
  const [trendsFilters, setTrendsFilters] = useState<TrendsFilters>({
    months: 12,
  });

  const handleDateRangeChange = useCallback(
    (startDate?: string, endDate?: string) => {
      setAnalyticsFilters({
        start_date: startDate,
        end_date: endDate,
      });
    },
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("analytics.page.title")}
        description={t("analytics.page.description")}
      />

      <ExchangeRateNote />

      <AnalyticsDateFilter
        onDateRangeChange={handleDateRangeChange}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpendingByCategory filters={analyticsFilters} />
        <MonthlyComparison filters={trendsFilters} />
      </div>

      <SpendingTrends
        trendsFilters={trendsFilters}
        analyticsFilters={analyticsFilters}
      />
    </div>
  );
}

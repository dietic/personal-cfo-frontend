"use client";

import { AnalyticsDateFilter } from "@/components/analytics-date-filter";
import ExchangeRateNote from "@/components/exchange-rate-note";
import { MonthlySpendingChart } from "@/components/monthly-spending-chart";
import { CategoryTrendsChart } from "@/components/category-trends-chart";
import { MonthlyCategoryChart } from "@/components/monthly-category-chart";
import { PageHeader } from "@/components/page-header";
import { SpendingByCategory } from "@/components/spending-by-category";
import { useI18n } from "@/lib/i18n";
import type { AnalyticsFilters, TrendsFilters } from "@/lib/types";
import { useCallback, useState } from "react";

export default function AnalyticsClient() {
  const { t } = useI18n();
  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>(
    {}
  );
  const [trendsFilters, setTrendsFilters] = useState<TrendsFilters>({
    months: new Date().getMonth() + 1, // Current month number (YTD)
  });

  const handleDateRangeChange = useCallback(
    (startDate?: string, endDate?: string) => {
      setAnalyticsFilters(prev => ({
        ...prev,
        start_date: startDate,
        end_date: endDate,
      }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpendingByCategory filters={analyticsFilters} />
        <MonthlySpendingChart trendsFilters={trendsFilters} />
      </div>

      <CategoryTrendsChart
        trendsFilters={trendsFilters}
      />
    </div>
  );
}

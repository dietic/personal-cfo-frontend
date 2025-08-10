"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { SpendingByCategory } from "@/components/spending-by-category";
import { MonthlyComparison } from "@/components/monthly-comparison";
import { SpendingTrends } from "@/components/spending-trends";
import { AnalyticsDateFilter } from "@/components/analytics-date-filter";
import ExchangeRateNote from "@/components/exchange-rate-note";
import type { AnalyticsFilters, TrendsFilters } from "@/lib/types";

export default function AnalyticsPage() {
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
        title="Analytics"
        description="Analyze your spending patterns and trends"
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

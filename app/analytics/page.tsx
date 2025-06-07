import { PageHeader } from "@/components/page-header"
import { SpendingByCategory } from "@/components/spending-by-category"
import { MonthlyComparison } from "@/components/monthly-comparison"
import { SpendingTrends } from "@/components/spending-trends"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description="Analyze your spending patterns and trends" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpendingByCategory />
        <MonthlyComparison />
      </div>

      <SpendingTrends />
    </div>
  )
}

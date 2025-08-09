import { Alerts } from "@/components/alerts";
import { BudgetProgress } from "@/components/budget-progress";
import { CardsDashboard } from "@/components/cards-dashboard";
import { DashboardHeader } from "@/components/dashboard-header";
import { RecentTransactions } from "@/components/recent-transactions";
import { RecurringServices } from "@/components/recurring-services";
import { SpendingOverview } from "@/components/spending-overview";

export default function DashboardRootPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CardsDashboard />
        </div>
        <div>
          <Alerts />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <SpendingOverview />
        </div>
        <div>
          <BudgetProgress />
        </div>
      </div>

      <RecurringServices />

      <RecentTransactions />
    </div>
  );
}

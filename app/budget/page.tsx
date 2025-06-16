import { PageHeader } from "@/components/page-header";
import { BudgetCategories } from "@/components/budget-categories";
import { BudgetSimulator } from "@/components/budget-simulator";

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Budget"
        description="Set and manage your monthly budgets"
      />

      <BudgetCategories />
      <BudgetSimulator />
    </div>
  );
}

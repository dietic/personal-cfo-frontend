import { PageHeader } from "@/components/page-header";
import { BudgetCategories } from "@/components/budget-categories";

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Budget"
        description="Set and manage your monthly budgets"
      />

      <BudgetCategories />
    </div>
  );
}

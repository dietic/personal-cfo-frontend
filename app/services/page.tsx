import { PageHeader } from "@/components/page-header"
import { RecurringServices } from "@/components/recurring-services"

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Recurring Services" description="Manage your monthly service payments and subscriptions" />
      <RecurringServices />
    </div>
  )
}

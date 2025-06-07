import { TransactionsList } from "@/components/transactions-list"
import { TransactionsFilter } from "@/components/transactions-filter"
import { PageHeader } from "@/components/page-header"

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="View and manage your transactions"
        action={{
          label: "Import Statement",
          href: "/transactions/import",
        }}
      />
      <TransactionsFilter />
      <TransactionsList />
    </div>
  )
}

import { StatementsList } from "@/components/statements-list";
import { ImportStatementDialog } from "@/components/import-statement-dialog";
import { PageHeader } from "@/components/page-header";

export default function StatementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bank Statements"
        description="Manage your uploaded bank statements"
        action={<ImportStatementDialog />}
      />
      <StatementsList />
    </div>
  );
}

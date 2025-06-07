import { StatementImport } from "@/components/statement-import";
import { PageHeader } from "@/components/page-header";

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Import Statement"
        description="Upload and process your bank statements to automatically import transactions"
        action={{
          label: "Back to Transactions",
          href: "/transactions",
        }}
      />
      <StatementImport />
    </div>
  );
}

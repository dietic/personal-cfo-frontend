"use client";

import { ImportStatementDialog } from "@/components/import-statement-dialog";
import { PageHeader } from "@/components/page-header";
import { StatementsList } from "@/components/statements-list";
import { useI18n } from "@/lib/i18n";

export default function StatementsClient() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("statements.page.title")}
        description={t("statements.page.description")}
        action={<ImportStatementDialog />}
      />
      <StatementsList />
    </div>
  );
}

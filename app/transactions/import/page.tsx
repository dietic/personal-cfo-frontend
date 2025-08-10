"use client";

import { PageHeader } from "@/components/page-header";
import { StatementImport } from "@/components/statement-import";
import { useI18n } from "@/lib/i18n";
import { Suspense } from "react";

function ImportPageContent() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("import.page.title")}
        description={t("import.page.description")}
        action={{
          label: t("import.page.backToTransactions"),
          href: "/transactions",
        }}
      />
      <StatementImport />
    </div>
  );
}

export default function ImportPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      }
    >
      <ImportPageContent />
    </Suspense>
  );
}

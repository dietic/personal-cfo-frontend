"use client";

import React, { Suspense } from "react";
import { StatementImport } from "@/components/statement-import";
import { PageHeader } from "@/components/page-header";

function ImportPageContent() {
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

export default function ImportPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
      <ImportPageContent />
    </Suspense>
  );
}

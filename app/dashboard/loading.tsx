"use client";

import { useI18n } from "@/lib/i18n";

export default function DashboardLoading() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-sm">{t("common.loading")}</span>
      </div>
    </div>
  );
}

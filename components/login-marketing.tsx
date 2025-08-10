"use client";

import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";

export function LoginMarketing() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Logo className="mx-auto h-20 w-20 text-primary" />
        <h2 className="text-2xl font-bold">PersonalCFO</h2>
        <p className="text-lg text-muted-foreground">
          {t("login.marketing.tagline")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 text-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
          <span>{t("login.features.smartCategorization")}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
          <span>{t("login.features.budgetTracking")}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
          <span>{t("login.features.analytics")}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
          <span>{t("login.features.securePrivate")}</span>
        </div>
      </div>
    </div>
  );
}

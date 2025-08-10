"use client";

import { useI18n } from "@/lib/i18n";

export function LoginCopy() {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        {t("auth.loginSuccess")}
      </h1>
      <p className="text-muted-foreground">{t("login.marketing.tagline")}</p>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForbiddenPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <ShieldAlert className="h-12 w-12 text-amber-500" />
      <h1 className="text-2xl font-bold">{t("forbidden.title")}</h1>
      <p className="text-muted-foreground max-w-md">{t("forbidden.message")}</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">{t("forbidden.goDashboard")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">{t("forbidden.settings")}</Link>
        </Button>
      </div>
    </div>
  );
}

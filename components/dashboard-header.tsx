"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { getUserInitials } from "@/lib/utils";

export function DashboardHeader() {
  const { data: user } = useUserProfile();
  const { t } = useI18n();
  const userInitials = getUserInitials(user || null);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 bg-primary text-primary-foreground">
              <AvatarFallback className="text-lg font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {t("dashboard.welcomeBack", { name: user?.first_name || "" })}
              </h1>
              <p className="text-muted-foreground">
                {t("dashboard.whatsHappening")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

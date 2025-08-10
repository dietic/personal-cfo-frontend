"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { getUserInitials } from "@/lib/utils";
import { Upload } from "lucide-react";

export function DashboardHeader() {
  const { data: user } = useUserProfile();
  const { t } = useI18n();
  const userInitials = getUserInitials(user || null);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src="/placeholder.svg?height=56&width=56"
                alt="User"
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
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
          <div className="flex items-center gap-2">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t("dashboard.importStatement")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

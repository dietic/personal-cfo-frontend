"use client";

import { ExcludedKeywordsManagement } from "@/components/excluded-keywords-management";
import { KeywordManagement } from "@/components/keyword-management";
import { PageHeader } from "@/components/page-header";
import { SimpleCategoriesManagement } from "@/components/simple-categories-management";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useBrandedCards, useSettings } from "@/lib/settings-context";
import { Ban, Bell, Key, Palette, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SettingsPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramTab = (searchParams.get("tab") as string) || "display";
  const [activeTab, setActiveTab] = useState(paramTab);
  const { updateSetting } = useSettings();
  const brandedCards = useBrandedCards();

  useEffect(() => {
    // Keep URL in sync when tab changes
    const current = searchParams.get("tab");
    if (activeTab !== current) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      router.replace(url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("settings.page.title")}
        description={t("settings.page.description")}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t("settings.tabs.display")}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            {t("settings.tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {t("settings.tabs.categories")}
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t("settings.tabs.keywords")}
          </TabsTrigger>
          <TabsTrigger value="excluded" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            {t("settings.tabs.excluded")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("settings.display.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.display.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("settings.display.brandedCards.label")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.display.brandedCards.help")}
                    </p>
                  </div>
                  <Switch
                    checked={brandedCards}
                    onCheckedChange={(checked) =>
                      updateSetting("brandedCards", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("settings.notifications.title")}
              </CardTitle>
              <CardDescription>
                {t("settings.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {t("settings.notifications.budgetAlerts.label")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.notifications.budgetAlerts.help")}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {t("settings.notifications.paymentReminders.label")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.notifications.paymentReminders.help")}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <SimpleCategoriesManagement
            onManageKeywords={() => setActiveTab("keywords")}
          />
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <KeywordManagement />
        </TabsContent>

        <TabsContent value="excluded" className="space-y-6">
          <ExcludedKeywordsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-muted-foreground">
          {t("settings.loading")}
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Tag, Key, Palette, Ban } from "lucide-react";
import { SimpleCategoriesManagement } from "@/components/simple-categories-management";
import { KeywordManagement } from "@/components/keyword-management";
import { useBrandedCards, useSettings } from "@/lib/settings-context";
import { useSearchParams, useRouter } from "next/navigation";
import { ExcludedKeywordsManagement } from "@/components/excluded-keywords-management";

export default function SettingsPage() {
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
        title="Settings"
        description="Manage your account preferences and categorization settings"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="display"
            className="flex items-center gap-2"
          >
            <Palette className="h-4 w-4" />
            Display
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="excluded" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Excluded keywords
          </TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Preferences
              </CardTitle>
              <CardDescription>
                Customize how your cards and data are displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Branded Cards</Label>
                    <p className="text-sm text-muted-foreground">
                      Show authentic bank colors on your cards instead of generic styling
                    </p>
                  </div>
                  <Switch
                    checked={brandedCards}
                    onCheckedChange={(checked) => updateSetting('brandedCards', checked)}
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
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you're close to your budget limits
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders for upcoming card payments
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

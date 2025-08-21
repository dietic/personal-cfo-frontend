"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { User } from "@/lib/types";

interface PlanFeature {
  name: string;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
}

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: User | null;
  onSelectPlan?: (plan: "free" | "plus" | "pro") => void;
}

export function UpgradeModal({
  open,
  onOpenChange,
  currentUser,
  onSelectPlan,
}: UpgradeModalProps) {
  const { t } = useI18n();

  const features: PlanFeature[] = [
    {
      name: t("upgrade.features.cards"),
      free: "2",
      plus: "5", 
      pro: t("upgrade.unlimited"),
    },
    {
      name: t("upgrade.features.budgets"),
      free: "3",
      plus: "10",
      pro: t("upgrade.unlimited"),
    },
    {
      name: t("upgrade.features.categories"),
      free: "10",
      plus: "25",
      pro: t("upgrade.unlimited"),
    },
    {
      name: t("upgrade.features.monthlyTransactions"),
      free: "100",
      plus: "500",
      pro: t("upgrade.unlimited"),
    },
    {
      name: t("upgrade.features.dataRetention"),
      free: t("upgrade.months", { count: 12 }),
      plus: t("upgrade.months", { count: 24 }),
      pro: t("upgrade.unlimited"),
    },
  ];

  const currentPlan = currentUser?.plan_tier || "free";
  
  const planConfig = {
    free: {
      name: t("upgrade.plans.free.name"),
      price: t("upgrade.plans.free.price"),
      icon: Crown,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-muted",
    },
    plus: {
      name: t("upgrade.plans.plus.name"),
      price: t("upgrade.plans.plus.price"),
      icon: Sparkles,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    pro: {
      name: t("upgrade.plans.pro.name"),
      price: t("upgrade.plans.pro.price"),
      icon: Zap,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  };

  const getFeatureValue = (feature: PlanFeature, plan: keyof typeof planConfig) => {
    const value = feature[plan];
    if (typeof value === "boolean") {
      return value ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : "—";
    }
    return value;
  };

  const getButtonText = (plan: keyof typeof planConfig) => {
    if (plan === currentPlan) {
      return t("upgrade.currentPlan");
    }
    const plans = ["free", "plus", "pro"];
    const currentIndex = plans.indexOf(currentPlan);
    const targetIndex = plans.indexOf(plan);
    
    if (targetIndex > currentIndex) {
      return t("upgrade.upgradeTo", { plan: planConfig[plan].name });
    } else {
      return t("upgrade.changeTo", { plan: planConfig[plan].name });
    }
  };

  const isCurrentPlan = (plan: keyof typeof planConfig) => plan === currentPlan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {t("upgrade.title")}
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {t("upgrade.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {Object.entries(planConfig).map(([planKey, config]) => {
            const plan = planKey as keyof typeof planConfig;
            const Icon = config.icon;
            
            return (
              <div
                key={plan}
                className={`relative rounded-lg border-2 p-6 ${
                  isCurrentPlan(plan) 
                    ? `${config.borderColor} ${config.bgColor}` 
                    : "border-border"
                }`}
              >
                {isCurrentPlan(plan) && (
                  <Badge 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    variant="default"
                  >
                    {t("upgrade.currentPlan")}
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${config.color}`} />
                  <h3 className="text-xl font-semibold text-foreground">{config.name}</h3>
                  <p className="text-2xl font-bold mt-2 text-foreground">{config.price}</p>
                </div>

                <Button
                  className="w-full mb-4"
                  variant={isCurrentPlan(plan) ? "secondary" : "default"}
                  disabled={isCurrentPlan(plan)}
                  onClick={() => onSelectPlan?.(plan)}
                >
                  {getButtonText(plan)}
                </Button>

                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{feature.name}</span>
                      <span className="font-medium text-foreground">
                        {getFeatureValue(feature, plan)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t("upgrade.footer")}
        </div>
      </DialogContent>
    </Dialog>
  );
}
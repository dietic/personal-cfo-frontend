"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface LimitWarning {
  feature: string;
  currentLimit: string;
  newLimit: string;
  willLose: boolean;
}

interface DowngradeWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: "plus" | "pro";
  targetPlan: "free" | "plus";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DowngradeWarningModal({
  open,
  onOpenChange,
  currentPlan,
  targetPlan,
  onConfirm,
  onCancel,
  isLoading = false,
}: DowngradeWarningModalProps) {
  const { t } = useI18n();

  // Define what the user will lose based on the downgrade
  const getDowngradeWarnings = (): LimitWarning[] => {
    if (currentPlan === "plus" && targetPlan === "free") {
      return [
        {
          feature: t("downgrade.features.cards"),
          currentLimit: "5",
          newLimit: "2",
          willLose: true,
        },
        {
          feature: t("downgrade.features.budgets"),
          currentLimit: "10",
          newLimit: "3",
          willLose: true,
        },
        {
          feature: t("downgrade.features.categories"),
          currentLimit: "25",
          newLimit: "10",
          willLose: true,
        },
        {
          feature: t("downgrade.features.monthlyTransactions"),
          currentLimit: "500",
          newLimit: "100",
          willLose: true,
        },
        {
          feature: t("downgrade.features.dataRetention"),
          currentLimit: t("downgrade.months", { count: 24 }),
          newLimit: t("downgrade.months", { count: 12 }),
          willLose: true,
        },
        {
          feature: t("downgrade.features.deleteOperations"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
        {
          feature: t("downgrade.features.exportData"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
      ];
    } else if (currentPlan === "pro" && targetPlan === "free") {
      return [
        {
          feature: t("downgrade.features.cards"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "2",
          willLose: true,
        },
        {
          feature: t("downgrade.features.budgets"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "3",
          willLose: true,
        },
        {
          feature: t("downgrade.features.categories"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "10",
          willLose: true,
        },
        {
          feature: t("downgrade.features.monthlyTransactions"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "100",
          willLose: true,
        },
        {
          feature: t("downgrade.features.dataRetention"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: t("downgrade.months", { count: 12 }),
          willLose: true,
        },
        {
          feature: t("downgrade.features.deleteOperations"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
        {
          feature: t("downgrade.features.exportData"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
        {
          feature: t("downgrade.features.advancedReports"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
        {
          feature: t("downgrade.features.bulkOperations"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
        {
          feature: t("downgrade.features.apiAccess"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
      ];
    } else if (currentPlan === "pro" && targetPlan === "plus") {
      return [
        {
          feature: t("downgrade.features.cards"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "5",
          willLose: true,
        },
        {
          feature: t("downgrade.features.budgets"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "10",
          willLose: true,
        },
        {
          feature: t("downgrade.features.categories"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "25",
          willLose: true,
        },
        {
          feature: t("downgrade.features.monthlyTransactions"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: "500",
          willLose: true,
        },
        {
          feature: t("downgrade.features.dataRetention"),
          currentLimit: t("downgrade.unlimited"),
          newLimit: t("downgrade.months", { count: 24 }),
          willLose: true,
        },
        {
          feature: t("downgrade.features.advancedReports"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
        {
          feature: t("downgrade.features.bulkOperations"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
        {
          feature: t("downgrade.features.apiAccess"),
          currentLimit: t("downgrade.available"),
          newLimit: t("downgrade.notAvailable"),
          willLose: true,
        },
      ];
    }

    return [];
  };

  const warnings = getDowngradeWarnings();
  const planNames = {
    free: t("upgrade.plans.free.name"),
    plus: t("upgrade.plans.plus.name"),
    pro: t("upgrade.plans.pro.name"),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {t("downgrade.title")}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {t("downgrade.subtitle", {
                  current: planNames[currentPlan],
                  target: planNames[targetPlan],
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-900 mb-2">
              {t("downgrade.warningTitle")}
            </h3>
            <p className="text-sm text-orange-800">
              {t("downgrade.warningMessage")}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              {t("downgrade.limitsTitle")}
            </h4>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {warning.feature}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">{warning.currentLimit}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-orange-600 font-medium">
                      {warning.newLimit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {t("downgrade.dataTitle")}
            </h4>
            <p className="text-sm text-blue-800">
              {t("downgrade.dataMessage")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("downgrade.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? t("downgrade.processing") : t("downgrade.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
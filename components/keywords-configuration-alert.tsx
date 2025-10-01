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
import { useCategoriesKeywordsValidation } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { AlertCircle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function KeywordsConfigurationAlert() {
  const router = useRouter();
  const { t } = useI18n();
  const { data: keywordValidation, isLoading } = useCategoriesKeywordsValidation();
  const [showAlert, setShowAlert] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Only show the alert if:
    // 1. We have validation data
    // 2. Keywords are insufficient
    // 3. The alert hasn't been shown yet for this session
    if (!isLoading && keywordValidation && !keywordValidation.has_minimum_keywords && !hasBeenShown) {
      setShowAlert(true);
      setHasBeenShown(true);
    }
  }, [keywordValidation, isLoading, hasBeenShown]);

  const handleConfigureKeywords = () => {
    setShowAlert(false);
    router.push("/settings?tab=keywords");
  };

  const handleDismiss = () => {
    setShowAlert(false);
  };

  if (!keywordValidation || isLoading) {
    return null;
  }

  return (
    <Dialog open={showAlert} onOpenChange={setShowAlert}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            Action Required: Configure Your Categories
          </DialogTitle>
          <DialogDescription className="text-left text-base">
            To ensure accurate categorization of your transactions, each category needs at least 20 keywords.
            This helps our system properly classify your spending patterns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-300">Categories Needing Attention</span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              The following categories don't have enough keywords for optimal categorization:
            </p>
          </div>

          <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <div className="grid grid-cols-1 gap-3">
              {keywordValidation.insufficient_categories.map((category) => (
                <div key={category.category_id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{category.category_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                      Current keywords: {category.current_keywords}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.current_keywords === 0
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : category.current_keywords < 10
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {category.current_keywords}/{category.required_keywords}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <strong>Next Steps:</strong> Go to Settings → Keywords to add keywords for each category.
              You can add keywords manually to improve categorization accuracy.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="sm:flex-1"
          >
            I'll Do It Later
          </Button>
          <Button
            onClick={handleConfigureKeywords}
            className="sm:flex-1"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure Keywords Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
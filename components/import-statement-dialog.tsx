"use client";

import { StatementImport } from "@/components/statement-import";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useCategoriesKeywordsValidation } from "@/lib/hooks";
import { Upload, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ImportStatementDialogProps {
  trigger?: React.ReactNode;
}

export function ImportStatementDialog({ trigger }: ImportStatementDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { data: keywordValidation, isLoading } = useCategoriesKeywordsValidation();

  const hasSufficientKeywords = keywordValidation?.has_minimum_keywords ?? true;
  const insufficientCategories = keywordValidation?.insufficient_categories ?? [];

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen || hasSufficientKeywords) {
      setOpen(newOpen);
    }
  };

  const triggerButton = trigger || (
    <Button
      disabled={!hasSufficientKeywords || isLoading}
      className="relative"
    >
      <Upload className="mr-2 h-4 w-4" />
      {t("import.cta")}
      {!hasSufficientKeywords && (
        <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("import.title")}</DialogTitle>
          <DialogDescription>{t("import.description")}</DialogDescription>
        </DialogHeader>
        {!hasSufficientKeywords && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold text-lg">Upload Disabled - Configuration Required</span>
            </div>
            <p className="text-yellow-700 text-sm mb-3">
              Statement upload is disabled because some categories don't have enough keywords for accurate categorization.
              Each category needs at least 20 keywords to ensure proper transaction classification.
            </p>
            {insufficientCategories.length > 0 && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3">
                <p className="text-yellow-800 font-medium text-sm mb-2">Categories needing attention:</p>
                <div className="space-y-2">
                  {insufficientCategories.map((cat) => (
                    <div key={cat.category_id} className="flex justify-between items-center text-sm">
                      <span className="text-yellow-800 font-medium">{cat.category_name}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        cat.current_keywords === 0
                          ? 'bg-red-100 text-red-800'
                          : cat.current_keywords < 10
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cat.current_keywords}/{cat.required_keywords} keywords
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-yellow-700 text-xs mt-3">
              Go to <strong>Settings → Keywords</strong> to configure your categories and enable upload functionality.
            </p>
          </div>
        )}
        <StatementImport />
      </DialogContent>
    </Dialog>
  );
}

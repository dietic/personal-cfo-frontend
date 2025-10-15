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
import { Upload } from "lucide-react";
import { useState } from "react";
// Removed tooltip and badge imports as gating was removed

interface ImportStatementDialogProps {
  trigger?: React.ReactNode;
}

export function ImportStatementDialog({ trigger }: ImportStatementDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  // Removed minimum-keywords validation gating per request

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const triggerButton =
    trigger || (
      <Button>
        <Upload className="mr-2 h-4 w-4" />
        {t("import.cta")}
      </Button>
    );

  return (
    <div className="flex flex-col items-stretch gap-3 md:items-end">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("import.title")}</DialogTitle>
            <DialogDescription>{t("import.description")}</DialogDescription>
          </DialogHeader>
          {/* Removed minimum-keywords warning banner per request */}
          <StatementImport />
        </DialogContent>
      </Dialog>
    </div>
  );
}

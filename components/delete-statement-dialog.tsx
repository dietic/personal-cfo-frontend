"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";
import { useDeleteStatement } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Statement } from "@/lib/types";
import { useState } from "react";

interface DeleteStatementDialogProps {
  statement: Statement;
  children: React.ReactNode;
}

export function DeleteStatementDialog({
  statement,
  children,
}: DeleteStatementDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteStatement();
  const { t } = useI18n();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(statement.id);
      setOpen(false);
    } catch (error) {
      console.error("Delete statement error:", error);
      // Error handling is done in the mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("statements.deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("statements.deleteDialog.description", {
              filename: statement.filename,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>{t("statements.deleteDialog.fileLabel")}:</strong>{" "}
            {statement.filename}
          </p>
          <p>
            <strong>{t("statements.deleteDialog.statusLabel")}:</strong>{" "}
            {statement.status}
          </p>
          <p>
            <strong>{t("statements.deleteDialog.uploadedLabel")}:</strong>{" "}
            {formatDate(statement.created_at)}
          </p>
          <p className="text-amber-600 font-medium">
            ⚠️ {t("statements.deleteDialog.warning")}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending
              ? t("statements.deleting")
              : t("statements.deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

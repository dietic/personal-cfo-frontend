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
import { useDeleteTransaction } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Transaction } from "@/lib/types";
import { useState } from "react";

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  children: React.ReactNode;
}

export function DeleteTransactionDialog({
  transaction,
  children,
}: DeleteTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteTransaction();
  const { t } = useI18n();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(transaction.id);
      setOpen(false);
    } catch (error) {
      console.error("Delete transaction error:", error);
      // Error handling is done in the mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("transactions.deleteOne.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("transactions.deleteOne.description", {
              name:
                transaction.description &&
                transaction.description !== transaction.merchant
                  ? transaction.description
                  : transaction.merchant,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>{t("transactions.info.amountLabel")}:</strong> $
            {transaction.amount}
          </p>
          <p>
            <strong>{t("transactions.info.dateLabel")}:</strong>{" "}
            {transaction.transaction_date}
          </p>
          {transaction.category && (
            <p>
              <strong>{t("transactions.info.categoryLabel")}:</strong>{" "}
              {transaction.category}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending
              ? t("transactions.deleting")
              : t("transactions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

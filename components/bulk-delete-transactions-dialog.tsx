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
} from "@/components/ui/alert-dialog";
import { useDeleteTransactionsBulk } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Transaction } from "@/lib/types";

interface BulkDeleteTransactionsDialogProps {
  transactions: Transaction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkDeleteTransactionsDialog({
  transactions,
  open,
  onOpenChange,
  onSuccess,
}: BulkDeleteTransactionsDialogProps) {
  const deleteMutation = useDeleteTransactionsBulk();
  const { t } = useI18n();

  const handleDelete = async () => {
    try {
      const transactionIds = transactions.map((t) => t.id);
      await deleteMutation.mutateAsync(transactionIds);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Bulk delete transactions error:", error);
      // Error handling is done in the mutation
    }
  };

  const totalAmount = transactions.reduce(
    (sum, t) => sum + parseFloat(t.amount),
    0
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("transactions.bulkDelete.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("transactions.bulkDelete.description", {
              count: String(transactions.length),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>{t("transactions.bulkDelete.totalTransactions")}:</strong>{" "}
            {transactions.length}
          </p>
          <p>
            <strong>{t("transactions.bulkDelete.totalAmount")}:</strong> $
            {totalAmount.toFixed(2)}
          </p>
          <div className="max-h-32 overflow-y-auto">
            <p>
              <strong>{t("transactions.bulkDelete.listLabel")}:</strong>
            </p>
            <ul className="list-disc pl-4 space-y-1">
              {transactions.slice(0, 5).map((transaction, index) => (
                <li key={transaction.id} className="text-xs">
                  {transaction.description &&
                  transaction.description !== transaction.merchant
                    ? transaction.description
                    : transaction.merchant}{" "}
                  - ${transaction.amount}
                </li>
              ))}
              {transactions.length > 5 && (
                <li className="text-xs italic">
                  {t("transactions.bulkDelete.more", {
                    count: String(transactions.length - 5),
                  })}
                </li>
              )}
            </ul>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending
              ? t("transactions.bulkDelete.deleting")
              : t("transactions.bulkDelete.confirm", {
                  count: String(transactions.length),
                })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

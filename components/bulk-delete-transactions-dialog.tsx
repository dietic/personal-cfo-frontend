"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
          <AlertDialogTitle>Delete Multiple Transactions</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {transactions.length} selected
            transaction{transactions.length > 1 ? "s" : ""}? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Total transactions:</strong> {transactions.length}
          </p>
          <p>
            <strong>Total amount:</strong> ${totalAmount.toFixed(2)}
          </p>
          <div className="max-h-32 overflow-y-auto">
            <p>
              <strong>Transactions:</strong>
            </p>
            <ul className="list-disc pl-4 space-y-1">
              {transactions.slice(0, 5).map((transaction, index) => (
                <li key={transaction.id} className="text-xs">
                  {transaction.merchant} - ${transaction.amount}
                </li>
              ))}
              {transactions.length > 5 && (
                <li className="text-xs italic">
                  ... and {transactions.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending
              ? "Deleting..."
              : `Delete ${transactions.length} Transaction${
                  transactions.length > 1 ? "s" : ""
                }`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

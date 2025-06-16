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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteTransaction } from "@/lib/hooks";
import { Transaction } from "@/lib/types";
import { toast } from "sonner";

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
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction from "
            {transaction.merchant}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Amount:</strong> ${transaction.amount}
          </p>
          <p>
            <strong>Date:</strong> {transaction.transaction_date}
          </p>
          {transaction.category && (
            <p>
              <strong>Category:</strong> {transaction.category}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Transaction"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { useDeleteStatement } from "@/lib/hooks";
import { Statement } from "@/lib/types";
import { toast } from "sonner";

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
          <AlertDialogTitle>Delete Statement</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{statement.filename}"? This will
            also delete all transactions associated with this statement. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>File:</strong> {statement.filename}
          </p>
          <p>
            <strong>Status:</strong> {statement.status}
          </p>
          <p>
            <strong>Uploaded:</strong>{" "}
            {new Date(statement.created_at).toLocaleDateString()}
          </p>
          <p className="text-amber-600 font-medium">
            ⚠️ All transactions from this statement will also be deleted
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Statement"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

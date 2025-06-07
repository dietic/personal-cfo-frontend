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
import { useDeleteCard } from "@/lib/hooks";
import { Card } from "@/lib/types";
import { toast } from "sonner";

interface DeleteCardDialogProps {
  card: Card;
  children: React.ReactNode;
}

export function DeleteCardDialog({ card, children }: DeleteCardDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteCard();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(card.id);
      setOpen(false);
      toast.success("Card deleted successfully");
    } catch (error) {
      console.error("Delete card error:", error);
      // Error handling is done in the mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{card.card_name}"? This action
            cannot be undone and will remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Card"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { useDeleteCard } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteCardDialogProps {
  card: Card;
  children: React.ReactNode;
}

export function DeleteCardDialog({ card, children }: DeleteCardDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteCard();
  const { t } = useI18n();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(card.id);
      setOpen(false);
      toast.success(t("card.deletedSuccessfully"));
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
          <AlertDialogTitle>{t("deleteCard.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteCard.description", { name: card.card_name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("deleteCard.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending
              ? t("deleteCard.deleting")
              : t("deleteCard.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

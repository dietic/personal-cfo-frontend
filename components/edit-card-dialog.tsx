"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCard } from "@/lib/hooks";
import { Card, CardUpdate } from "@/lib/types";
import { toast } from "sonner";

interface EditCardDialogProps {
  card: Card;
  children: React.ReactNode;
}

export function EditCardDialog({ card, children }: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CardUpdate>({
    card_name: card.card_name,
    card_type: card.card_type || "",
    network_provider: card.network_provider || "",
    bank_provider: card.bank_provider || "",
    payment_due_date: card.payment_due_date || "",
  });

  const updateMutation = useUpdateCard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.card_name?.trim()) {
      toast.error("Card name is required");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        cardId: card.id,
        data: formData,
      });
      setOpen(false);
      toast.success("Card updated successfully");
    } catch (error) {
      console.error("Update card error:", error);
      // Error handling is done in the mutation
    }
  };

  const handleInputChange = (field: keyof CardUpdate, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update your card information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card_name" className="text-right">
                Card Name
              </Label>
              <Input
                id="card_name"
                value={formData.card_name || ""}
                onChange={(e) => handleInputChange("card_name", e.target.value)}
                className="col-span-3"
                placeholder="My Credit Card"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card_type" className="text-right">
                Card Type
              </Label>
              <Select
                value={formData.card_type || ""}
                onValueChange={(value) => handleInputChange("card_type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Charge Card">Charge Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network_provider" className="text-right">
                Network
              </Label>
              <Select
                value={formData.network_provider || ""}
                onValueChange={(value) =>
                  handleInputChange("network_provider", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="Mastercard">Mastercard</SelectItem>
                  <SelectItem value="American Express">
                    American Express
                  </SelectItem>
                  <SelectItem value="Discover">Discover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank_provider" className="text-right">
                Bank
              </Label>
              <Input
                id="bank_provider"
                value={formData.bank_provider || ""}
                onChange={(e) =>
                  handleInputChange("bank_provider", e.target.value)
                }
                className="col-span-3"
                placeholder="Bank Name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_due_date" className="text-right">
                Due Date
              </Label>
              <Input
                id="payment_due_date"
                type="date"
                value={formData.payment_due_date || ""}
                onChange={(e) =>
                  handleInputChange("payment_due_date", e.target.value)
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

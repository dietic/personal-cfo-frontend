"use client";

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
import { useToast } from "@/hooks/use-toast";
import { useBankProviders, useCreateCard } from "@/lib/hooks";
import { CardCreate } from "@/lib/types";
import { Building2, CreditCard, Plus } from "lucide-react";
import { useState } from "react";

interface AddCardDialogProps {
  children?: React.ReactNode;
}

export function AddCardDialog({ children }: AddCardDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    card_name: "",
    bank_provider_id: "",
    payment_due_date: "",
  });

  // Fetch bank providers data - defaulting to Peru since that's our focus
  const { data: bankProviders, isLoading: bankProvidersLoading } =
    useBankProviders("PE", false);

  const createCardMutation = useCreateCard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cardData: CardCreate = {
      card_name: formData.card_name,
      bank_provider_id: formData.bank_provider_id || null,
      payment_due_date: formData.payment_due_date || null,
    };

    try {
      await createCardMutation.mutateAsync(cardData);
      toast({ title: "Card added successfully" });
      setFormData({
        card_name: "",
        bank_provider_id: "",
        payment_due_date: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to add card:", error);
      toast({
        title: "Error",
        description: "Failed to add card",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Add New Card
            </DialogTitle>
            <DialogDescription>
              Add a new credit or debit card to track your transactions and
              balances.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="card_name">Card Name</Label>
              <Input
                id="card_name"
                value={formData.card_name}
                onChange={(e) =>
                  setFormData({ ...formData, card_name: e.target.value })
                }
                placeholder="e.g. Chase Sapphire, Wells Fargo Checking"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank_provider_id">
                <Building2 className="w-4 h-4 inline mr-2" />
                Bank Provider
              </Label>
              <Select
                value={formData.bank_provider_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, bank_provider_id: value })
                }
                disabled={bankProvidersLoading}
              >
                <SelectTrigger id="bank_provider_id">
                  <SelectValue
                    placeholder={
                      bankProvidersLoading
                        ? "Loading banks..."
                        : "Select your bank"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {/* Popular banks first */}
                  {bankProviders
                    ?.filter((bank) => bank.is_popular)
                    .map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {bank.short_name || bank.name}
                          </span>
                          {bank.short_name && bank.short_name !== bank.name && (
                            <span className="text-xs text-muted-foreground">
                              ({bank.name})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}

                  {/* Separator if we have both popular and regular banks */}
                  {bankProviders?.some((bank) => bank.is_popular) &&
                    bankProviders?.some((bank) => !bank.is_popular) && (
                      <SelectItem value="separator" disabled>
                        ──────────────────
                      </SelectItem>
                    )}

                  {/* Other banks */}
                  {bankProviders
                    ?.filter((bank) => !bank.is_popular)
                    .map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center gap-2">
                          <span>{bank.short_name || bank.name}</span>
                          {bank.short_name && bank.short_name !== bank.name && (
                            <span className="text-xs text-muted-foreground">
                              ({bank.name})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_due_date">
                Payment Due Date (optional)
              </Label>
              <Input
                id="payment_due_date"
                type="date"
                value={formData.payment_due_date}
                onChange={(e) =>
                  setFormData({ ...formData, payment_due_date: e.target.value })
                }
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
            <Button type="submit" disabled={createCardMutation.isPending}>
              {createCardMutation.isPending ? "Adding..." : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

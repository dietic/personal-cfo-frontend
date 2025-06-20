"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CreditCard, Building2 } from "lucide-react";
import { useCreateCard, useBankProviders } from "@/lib/hooks";
import { CardCreate } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AddCardDialogProps {
  children?: React.ReactNode;
}

export function AddCardDialog({ children }: AddCardDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    card_name: "",
    card_type: "",
    network_provider: "",
    bank_provider_id: "",  // Changed to bank_provider_id
    payment_due_date: "",
  });

  // Fetch bank providers - defaulting to Peru since that's our focus
  const { data: bankProviders, isLoading: bankProvidersLoading } = useBankProviders("PE", false);

  const createCardMutation = useCreateCard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cardData: CardCreate = {
      card_name: formData.card_name,
      card_type: formData.card_type || null,
      network_provider: formData.network_provider || null,
      bank_provider_id: formData.bank_provider_id || null,  // Updated field name
      payment_due_date: formData.payment_due_date || null,
    };

    try {
      await createCardMutation.mutateAsync(cardData);
      toast({ title: "Card added successfully" });
      setFormData({
        card_name: "",
        card_type: "",
        network_provider: "",
        bank_provider_id: "",  // Updated field name
        payment_due_date: "",
      });
      setOpen(false);
    } catch (error) {
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
              <Label htmlFor="card_type">Card Type</Label>
              <Select
                value={formData.card_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, card_type: value })
                }
              >
                <SelectTrigger id="card_type">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Charge Card">Charge Card</SelectItem>
                  <SelectItem value="Prepaid Card">Prepaid Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="network_provider">Network Provider</Label>
              <Select
                value={formData.network_provider}
                onValueChange={(value) =>
                  setFormData({ ...formData, network_provider: value })
                }
              >
                <SelectTrigger id="network_provider">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="Mastercard">Mastercard</SelectItem>
                  <SelectItem value="American Express">
                    American Express
                  </SelectItem>
                  <SelectItem value="Discover">Discover</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                    ?.filter(bank => bank.is_popular)
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
                  {bankProviders?.some(bank => bank.is_popular) && 
                   bankProviders?.some(bank => !bank.is_popular) && (
                    <SelectItem value="separator" disabled>
                      ──────────────────
                    </SelectItem>
                  )}
                  
                  {/* Other banks */}
                  {bankProviders
                    ?.filter(bank => !bank.is_popular)
                    .map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center gap-2">
                          <span>
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

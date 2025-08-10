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
import { useBankProviders, useUpdateCard } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Card, CardUpdate } from "@/lib/types";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditCardDialogProps {
  card: Card;
  children: React.ReactNode;
}

export function EditCardDialog({ card, children }: EditCardDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CardUpdate>({
    card_name: card.card_name,
    card_type: card.card_type || "",
    network_provider: card.network_provider || "",
    bank_provider_id: card.bank_provider_id || "", // Updated field name
    payment_due_date: card.payment_due_date || "",
  });

  // Fetch bank providers for dropdown
  const { data: bankProviders, isLoading: bankProvidersLoading } =
    useBankProviders("PE", false);

  const updateMutation = useUpdateCard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.card_name?.trim()) {
      toast.error(t("card.errors.nameRequired"));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        cardId: card.id,
        data: formData,
      });
      setOpen(false);
      toast.success(t("card.updatedSuccessfully"));
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
          <DialogTitle>{t("card.edit.title")}</DialogTitle>
          <DialogDescription>{t("card.edit.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card_name" className="text-right">
                {t("card.form.name")}
              </Label>
              <Input
                id="card_name"
                value={formData.card_name || ""}
                onChange={(e) => handleInputChange("card_name", e.target.value)}
                className="col-span-3"
                placeholder={t("card.form.namePlaceholder")}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card_type" className="text-right">
                {t("card.form.type")}
              </Label>
              <Select
                value={formData.card_type || ""}
                onValueChange={(value) => handleInputChange("card_type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("card.form.typePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">
                    {t("card.form.typeCredit")}
                  </SelectItem>
                  <SelectItem value="Debit Card">
                    {t("card.form.typeDebit")}
                  </SelectItem>
                  <SelectItem value="Charge Card">
                    {t("card.form.typeCharge")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network_provider" className="text-right">
                {t("card.form.network")}
              </Label>
              <Select
                value={formData.network_provider || ""}
                onValueChange={(value) =>
                  handleInputChange("network_provider", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue
                    placeholder={t("card.form.networkPlaceholder")}
                  />
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
              <Label htmlFor="bank_provider_id" className="text-right">
                <Building2 className="w-4 h-4 inline mr-1" />
                {t("card.form.bank")}
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.bank_provider_id || ""}
                  onValueChange={(value) =>
                    handleInputChange("bank_provider_id", value)
                  }
                  disabled={bankProvidersLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        bankProvidersLoading
                          ? t("card.form.loadingBanks")
                          : t("card.form.bankPlaceholder")
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
                            {bank.short_name &&
                              bank.short_name !== bank.name && (
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
                            {bank.short_name &&
                              bank.short_name !== bank.name && (
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_due_date" className="text-right">
                {t("card.form.dueDate")}
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? t("common.updating")
                : t("card.edit.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

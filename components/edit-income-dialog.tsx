"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import type { Income, Card } from "@/lib/types";

const formSchema = z.object({
  amount: z.string().min(0.01, "Amount must be greater than 0"),
  currency: z.string().default("USD"),
  description: z.string().min(1, "Description is required"),
  income_date: z.date({ required_error: "Income date is required" }),
  is_recurring: z.boolean().default(false),
  card_id: z.string().min(1, "Card selection is required"),
});

type FormData = z.infer<typeof formSchema>;

interface EditIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income | null;
}

export function EditIncomeDialog({ open, onOpenChange, income }: EditIncomeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      currency: "USD",
      description: "",
      income_date: new Date(),
      is_recurring: false,
      card_id: "",
    },
  });

  const isRecurring = form.watch("is_recurring");

  useEffect(() => {
    if (open) {
      const fetchCards = async () => {
        try {
          const userCards = await apiClient.getCards();
          setCards(userCards);
        } catch (error) {
          console.error("Error fetching cards:", error);
        }
      };
      fetchCards();
    }
  }, [open]);

  useEffect(() => {
    if (income && open) {
      form.reset({
        amount: income.amount.toString(),
        currency: income.currency,
        description: income.description,
        income_date: new Date(income.income_date),
        is_recurring: income.is_recurring,
        card_id: income.card_id,
      });
    }
  }, [income, open, form]);

  const onSubmit = async (data: FormData) => {
    if (!income) return;
    
    setIsLoading(true);
    try {
      const incomeData = {
        amount: parseFloat(data.amount),
        currency: data.currency,
        description: data.description,
        income_date: format(data.income_date, "yyyy-MM-dd"),
        is_recurring: data.is_recurring,
        card_id: data.card_id,
      };

      await apiClient.updateIncome(income.id, incomeData);

      toast({
        title: t("incomes.update.success.title"),
        description: t("incomes.update.success.description"),
      });

      // Refresh both incomes list and summary
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-income-summary"] });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating income:", error);
      toast({
        title: t("incomes.update.error.title"),
        description: error.message || t("incomes.update.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("incomes.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("incomes.edit.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incomes.form.amount.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incomes.form.currency.label")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="PEN">PEN - Peruvian Sol</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="card_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incomes.form.card.label")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("incomes.form.card.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.card_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("incomes.form.description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("incomes.form.description.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="income_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("incomes.form.date.label")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("incomes.form.date.placeholder")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t("incomes.form.recurring.label")}
                    </FormLabel>
                    <FormDescription>
                      {t("incomes.form.recurring.description")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("common.saving") : t("common.saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
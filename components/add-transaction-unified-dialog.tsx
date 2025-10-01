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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  useCards,
  useCategoryList,
  useCreateTransaction,
  useCurrencies,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { TransactionCreate, IncomeCreate } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

const baseSchema = z.object({
  type: z.enum(["income", "outcome"]),
  merchant: z.string().optional(),
  source: z.string().optional(),
  amount: z.coerce
    .number()
    .min(0.01, "transactions.form.amountGreaterThanZero"),
  currency: z.string().min(1, "transactions.form.currencyRequired"),
  category: z.string().optional(),
  transaction_date: z.string().min(1, "transactions.form.dateRequired"),
  card_id: z.string().min(1, "transactions.form.cardRequired"),
  description: z.string().optional(),
  is_recurring: z.boolean().default(false),
});

const transactionSchema = baseSchema.superRefine((data, ctx) => {
  // Validate merchant for outcome transactions
  if (data.type === "outcome" && (!data.merchant || data.merchant.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "transactions.form.merchantRequired",
      path: ["merchant"],
    });
  }

  // Validate source for income transactions
  if (data.type === "income" && (!data.source || data.source.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "incomes.form.sourceRequired",
      path: ["source"],
    });
  }

  // Validate category for outcome transactions
  if (data.type === "outcome" && (!data.category || data.category.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "transactions.form.categoryRequired",
      path: ["category"],
    });
  }
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionUnifiedDialogProps {
  defaultType?: "income" | "outcome";
}

export function AddTransactionUnifiedDialog({ defaultType = "outcome" }: AddTransactionUnifiedDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: cards } = useCards();
  const { data: categories } = useCategoryList();
  const { data: currencies } = useCurrencies();
  const createTransaction = useCreateTransaction();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      merchant: "",
      source: "",
      amount: 0,
      currency: "",
      category: "",
      transaction_date: new Date().toISOString().split("T")[0],
      card_id: "",
      description: "",
      is_recurring: false,
    },
  });

  const transactionType = form.watch("type");

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (data.type === "outcome") {
        // Create outcome transaction
        const transactionData: TransactionCreate = {
          merchant: data.merchant || "",
          amount: data.amount.toString(),
          currency: data.currency,
          category: data.category || null,
          transaction_date: data.transaction_date,
          description: data.description || null,
          card_id: data.card_id,
        };

        await createTransaction.mutateAsync(transactionData);
        toast.success(t("transaction.createdSuccessfully"));
      } else {
        // Create income transaction
        const incomeData: IncomeCreate = {
          amount: data.amount.toString(),
          currency: data.currency,
          description: data.description || "",
          source: data.source || "",
          income_date: data.transaction_date,
          is_recurring: data.is_recurring,
          card_id: data.card_id,
        };

        await apiClient.createIncome(incomeData);
        toast.success(t("incomes.create.success.title"));
      }

      // Reset form and close dialog
      form.reset();
      setOpen(false);

      // Refresh the appropriate lists
      if (data.type === "outcome") {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["incomes"] });
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
      if (data.type === "outcome") {
        toast.error(t("transaction.createFailed"));
      } else {
        toast.error(t("incomes.create.error.title"));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>{t("transactions.add.cta")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transactionType === "income"
              ? t("incomes.add.title")
              : t("transactions.add.title")
            }
          </DialogTitle>
          <DialogDescription>
            {transactionType === "income"
              ? t("incomes.add.description")
              : t("transactions.add.description")
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type Selector */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactions.form.type")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("transactions.form.typePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">{t("transactions.types.income")}</SelectItem>
                      <SelectItem value="outcome">{t("transactions.types.outcome")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Merchant/Source Fields */}
            {transactionType === "outcome" ? (
              <FormField
                control={form.control}
                name="merchant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("transactions.form.merchant")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("transactions.form.merchantPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("incomes.form.source.label")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("incomes.form.source.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Amount and Currency Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("transactions.form.amount")}</FormLabel>
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
                    <FormLabel>{t("transactions.form.currency")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "transactions.form.currencyPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies?.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category Field (only for outcomes) */}
            {transactionType === "outcome" && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("transactions.form.category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "transactions.form.categoryPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            <div className="flex items-center gap-2">
                              {category.emoji && (
                                <span className="text-base">{category.emoji}</span>
                              )}
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Date and Card Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {transactionType === "income"
                        ? t("incomes.form.date.label")
                        : t("transactions.form.date")
                      }
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="card_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {transactionType === "income"
                        ? t("incomes.form.card.label")
                        : t("transactions.form.card")
                      }
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              transactionType === "income"
                                ? t("incomes.form.card.placeholder")
                                : t("transactions.form.cardPlaceholder")
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cards?.map((card) => (
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
            </div>

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {transactionType === "income"
                      ? t("incomes.form.description.label")
                      : t("transactions.form.description")
                    }
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        transactionType === "income"
                          ? t("incomes.form.description.placeholder")
                          : t("transactions.form.descriptionPlaceholder")
                      }
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Switch (only for incomes) */}
            {transactionType === "income" && (
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("incomes.form.recurring.label")}
                      </FormLabel>
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
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createTransaction.isPending}>
                {createTransaction.isPending
                  ? t("common.saving")
                  : transactionType === "income"
                    ? t("incomes.add.save")
                    : t("transactions.add.submit")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
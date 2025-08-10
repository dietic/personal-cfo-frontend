"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBudgets,
  useCategories,
  useCategorySpending,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Budget, BudgetCreate, BudgetUpdate } from "@/lib/types";
import { format } from "date-fns";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BudgetFormData {
  category: string;
  amount: string;
  currency: string;
  period: "monthly" | "weekly" | "yearly";
}

const initialFormData: BudgetFormData = {
  category: "",
  amount: "",
  currency: "USD",
  period: "monthly",
};

export function BudgetCategories() {
  const { t } = useI18n();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>(initialFormData);

  const {
    data: budgets,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useBudgets();
  const { data: categorySpending, isLoading: spendingLoading } =
    useCategorySpending({
      start_date: format(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        "yyyy-MM-dd"
      ),
      end_date: format(new Date(), "yyyy-MM-dd"),
    });
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const handleCreateBudget = async () => {
    if (!formData.category || !formData.amount) {
      toast.error(t("common.fillAllFields"));
      return;
    }

    // Generate the first day of the current month as the budget month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-01`;

    const budgetData: BudgetCreate = {
      category: formData.category,
      limit_amount: parseFloat(formData.amount),
      currency: formData.currency,
      month: currentMonth,
    };

    try {
      await createBudgetMutation.mutateAsync(budgetData);
      toast.success(t("budget.createdSuccessfully"));
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
    } catch (error: any) {
      console.error("Budget creation error:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        t("budget.createFailed");
      toast.error(errorMessage);
    }
  };

  const handleUpdateBudget = async () => {
    if (!selectedBudget || !formData.category || !formData.amount) {
      toast.error(t("common.fillAllFields"));
      return;
    }

    // Generate the first day of the current month as the budget month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-01`;

    const budgetData: BudgetUpdate = {
      category: formData.category,
      limit_amount: parseFloat(formData.amount),
      currency: formData.currency,
      month: currentMonth,
    };

    try {
      await updateBudgetMutation.mutateAsync({
        budgetId: selectedBudget.id,
        data: budgetData,
      });
      toast.success(t("budget.updatedSuccessfully"));
      setIsEditDialogOpen(false);
      setSelectedBudget(null);
      setFormData(initialFormData);
    } catch (error: any) {
      console.error("Budget update error:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        t("budget.updateFailed");
      toast.error(errorMessage);
    }
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;

    try {
      await deleteBudgetMutation.mutateAsync(selectedBudget.id);
      toast.success(t("budget.deletedSuccessfully"));
      setIsDeleteDialogOpen(false);
      setSelectedBudget(null);
    } catch (error) {
      toast.error(t("budget.deleteFailed"));
    }
  };

  const openEditDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.limit_amount.toString(),
      currency: budget.currency || "USD", // Fallback to USD if currency not set
      period: "monthly", // Default to monthly since the API uses month field
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  const getBudgetProgress = (budget: Budget) => {
    const spending = categorySpending?.find(
      (s) => s.category === budget.category && s.currency === budget.currency
    );
    const spent = parseFloat(spending?.amount || "0");
    const percentage =
      parseFloat(budget.limit_amount) > 0
        ? (spent / parseFloat(budget.limit_amount)) * 100
        : 0;
    return { spent, percentage: Math.min(percentage, 100) };
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formattedAmount = amount.toFixed(2);
    const currencySymbol =
      currency === "USD"
        ? "$"
        : currency === "PEN"
        ? "S/"
        : currency === "EUR"
        ? "€"
        : currency === "GBP"
        ? "£"
        : currency + " ";
    return `${currencySymbol}${formattedAmount}`;
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100)
      return {
        variant: "destructive" as const,
        label: t("budget.status.over"),
      };
    if (percentage >= 80)
      return { variant: "secondary" as const, label: t("budget.status.near") };
    return { variant: "default" as const, label: t("budget.status.ok") };
  };

  if (budgetsError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            {t("budget.loadFailed")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("budget.categories.title")}</span>
            <Skeleton className="h-9 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("budget.categories.title")}</span>
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("budget.categories.add")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!budgets || budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">{t("budget.empty.title")}</div>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("budget.empty.cta")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const { spent, percentage } = getBudgetProgress(budget);
                const status = getBudgetStatus(percentage);
                const percentLabel = percentage.toFixed(1);

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{budget.category}</span>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(spent, budget.currency)} /{" "}
                          {formatCurrency(
                            parseFloat(budget.limit_amount),
                            budget.currency
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(budget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(budget)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                      indicatorClassName={
                        percentage >= 100
                          ? "bg-red-500"
                          : percentage >= 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t("budget.used", { percent: percentLabel })}</span>
                      <span>
                        {t("budget.remaining", {
                          amount: formatCurrency(
                            parseFloat(budget.limit_amount) - spent,
                            budget.currency
                          ),
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Budget Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("budget.create.title")}</DialogTitle>
            <DialogDescription>
              {t("budget.create.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">{t("budget.form.category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("budget.form.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="" disabled>
                      {t("budget.form.loadingCategories")}
                    </SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      {t("budget.form.noCategories")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">{t("budget.form.amount")}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={t("budget.form.amountPlaceholder")}
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="currency">{t("budget.form.currency")}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("budget.form.selectCurrency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">{t("currency.USD")}</SelectItem>
                  <SelectItem value="PEN">{t("currency.PEN")}</SelectItem>
                  <SelectItem value="EUR">{t("currency.EUR")}</SelectItem>
                  <SelectItem value="GBP">{t("currency.GBP")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period">{t("budget.form.period")}</Label>
              <Select
                value={formData.period}
                onValueChange={(value: "monthly" | "weekly" | "yearly") =>
                  setFormData({ ...formData, period: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    {t("budget.form.weekly")}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t("budget.form.monthly")}
                  </SelectItem>
                  <SelectItem value="yearly">
                    {t("budget.form.yearly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateBudget}
              disabled={createBudgetMutation.isPending}
            >
              {createBudgetMutation.isPending
                ? t("budget.creating")
                : t("budget.create.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("budget.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("budget.edit.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category">{t("budget.form.category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("budget.form.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="" disabled>
                      {t("budget.form.loadingCategories")}
                    </SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      {t("budget.form.noCategories")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-amount">{t("budget.form.amount")}</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder={t("budget.form.amountPlaceholder")}
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-currency">{t("budget.form.currency")}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("budget.form.selectCurrency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">{t("currency.USD")}</SelectItem>
                  <SelectItem value="PEN">{t("currency.PEN")}</SelectItem>
                  <SelectItem value="EUR">{t("currency.EUR")}</SelectItem>
                  <SelectItem value="GBP">{t("currency.GBP")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-period">{t("budget.form.period")}</Label>
              <Select
                value={formData.period}
                onValueChange={(value: "monthly" | "weekly" | "yearly") =>
                  setFormData({ ...formData, period: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    {t("budget.form.weekly")}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t("budget.form.monthly")}
                  </SelectItem>
                  <SelectItem value="yearly">
                    {t("budget.form.yearly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdateBudget}
              disabled={updateBudgetMutation.isPending}
            >
              {updateBudgetMutation.isPending
                ? t("budget.updating")
                : t("budget.edit.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Budget Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("budget.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("budget.delete.description", {
                name: selectedBudget?.category ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBudget}
              disabled={deleteBudgetMutation.isPending}
            >
              {deleteBudgetMutation.isPending
                ? t("budget.deleting")
                : t("budget.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

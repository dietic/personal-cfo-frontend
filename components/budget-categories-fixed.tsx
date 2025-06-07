"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Save, X, Plus } from "lucide-react";
import {
  useBudgets,
  useCategorySpending,
  useUpdateBudget,
  useCreateBudget,
  useDeleteBudget,
} from "@/lib/hooks";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BudgetCreate } from "@/lib/types";

export function BudgetCategories() {
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

  const updateBudgetMutation = useUpdateBudget();
  const createBudgetMutation = useCreateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<Partial<BudgetCreate>>({
    category: "",
    limit_amount: "",
    month: format(new Date(), "yyyy-MM"),
  });

  const isLoading = budgetsLoading || spendingLoading;

  // Create a map of category spending for current month
  const spendingMap =
    categorySpending?.reduce((acc, item) => {
      acc[item.category.toLowerCase()] = parseFloat(item.amount);
      return acc;
    }, {} as Record<string, number>) || {};

  // Process budget data with current spending
  const processedBudgets =
    budgets?.map((budget) => {
      const spent = spendingMap[budget.category.toLowerCase()] || 0;
      const limitAmount = parseFloat(budget.limit_amount);
      const percentage =
        limitAmount > 0 ? Math.round((spent / limitAmount) * 100) : 0;

      return {
        ...budget,
        spent,
        budget: limitAmount,
        percentage,
      };
    }) || [];

  const handleEdit = (id: string, currentBudget: number) => {
    setEditingId(id);
    setEditValue(currentBudget.toString());
  };

  const handleSave = async (id: string) => {
    try {
      await updateBudgetMutation.mutateAsync({
        budgetId: id,
        data: {
          limit_amount: editValue,
        },
      });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBudget.category || !newBudget.limit_amount || !newBudget.month) {
      return;
    }

    try {
      await createBudgetMutation.mutateAsync({
        category: newBudget.category!,
        limit_amount: newBudget.limit_amount!,
        month: newBudget.month!,
      });

      setNewBudget({
        category: "",
        limit_amount: "",
        month: format(new Date(), "yyyy-MM"),
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create budget:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudgetMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  if (budgetsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>
            Set and manage your monthly budget limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load budget data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>
                Set and manage your monthly budget limits
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>
              Set and manage your monthly budget limits
            </CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateBudget}>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                  <DialogDescription>
                    Set a monthly spending limit for a category.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newBudget.category || ""}
                      onChange={(e) =>
                        setNewBudget({ ...newBudget, category: e.target.value })
                      }
                      placeholder="e.g. Food, Transportation, Entertainment"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="limit_amount">Budget Limit</Label>
                    <Input
                      id="limit_amount"
                      type="number"
                      step="0.01"
                      value={newBudget.limit_amount || ""}
                      onChange={(e) =>
                        setNewBudget({
                          ...newBudget,
                          limit_amount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="month">Month</Label>
                    <Input
                      id="month"
                      type="month"
                      value={newBudget.month || ""}
                      onChange={(e) =>
                        setNewBudget({ ...newBudget, month: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBudgetMutation.isPending}
                  >
                    Create Budget
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {processedBudgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No budgets set. Create your first budget to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {processedBudgets.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium capitalize">
                    {budget.category}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      ${budget.spent.toFixed(2)} /
                    </span>
                    {editingId === budget.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 h-8 text-sm"
                          type="number"
                          step="0.01"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(budget.id)}
                          disabled={updateBudgetMutation.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          ${budget.budget.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget.id, budget.budget)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Progress
                  value={budget.percentage}
                  max={150}
                  className={`h-3 ${
                    budget.percentage > 100
                      ? "bg-red-100"
                      : budget.percentage > 80
                      ? "bg-amber-100"
                      : ""
                  }`}
                  indicatorClassName={`${
                    budget.percentage > 100
                      ? "bg-destructive"
                      : budget.percentage > 80
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {budget.percentage > 100
                      ? `${budget.percentage - 100}% over budget`
                      : `${100 - budget.percentage}% remaining`}
                  </span>
                  <span>{budget.percentage}% used</span>
                </div>

                {budget.percentage > 90 && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                      disabled={deleteBudgetMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

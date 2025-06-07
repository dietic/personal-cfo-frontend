"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useBudgets,
  useCategorySpending,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/lib/hooks";
import { Budget, BudgetCreate, BudgetUpdate } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface BudgetFormData {
  category: string;
  amount: string;
  period: "monthly" | "weekly" | "yearly";
}

const initialFormData: BudgetFormData = {
  category: "",
  amount: "",
  period: "monthly",
};

const categories = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Groceries",
  "Gas",
  "Other",
];

export function BudgetCategories() {
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
    useCategorySpending();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const handleCreateBudget = async () => {
    if (!formData.category || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const budgetData: BudgetCreate = {
      category: formData.category,
      limit_amount: parseFloat(formData.amount),
      month: formData.period,
    };

    try {
      await createBudgetMutation.mutateAsync(budgetData);
      toast.success("Budget created successfully");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast.error("Failed to create budget");
    }
  };

  const handleUpdateBudget = async () => {
    if (!selectedBudget || !formData.category || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const budgetData: BudgetUpdate = {
      category: formData.category,
      limit_amount: parseFloat(formData.amount),
      month: formData.period,
    };

    try {
      await updateBudgetMutation.mutateAsync({
        budgetId: selectedBudget.id,
        data: budgetData,
      });
      toast.success("Budget updated successfully");
      setIsEditDialogOpen(false);
      setSelectedBudget(null);
      setFormData(initialFormData);
    } catch (error) {
      toast.error("Failed to update budget");
    }
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;

    try {
      await deleteBudgetMutation.mutateAsync(selectedBudget.id);
      toast.success("Budget deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedBudget(null);
    } catch (error) {
      toast.error("Failed to delete budget");
    }
  };

  const openEditDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.limit_amount.toString(),
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
      (s) => s.category === budget.category
    );
    const spent = parseFloat(spending?.amount || "0");
    const percentage =
      parseFloat(budget.limit_amount) > 0
        ? (spent / parseFloat(budget.limit_amount)) * 100
        : 0;
    return { spent, percentage: Math.min(percentage, 100) };
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100)
      return { variant: "destructive" as const, label: "Over Budget" };
    if (percentage >= 80)
      return { variant: "secondary" as const, label: "Near Limit" };
    return { variant: "default" as const, label: "On Track" };
  };

  if (budgetsError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Failed to load budgets. Please try again.
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
            <span>Budget Categories</span>
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
            <span>Budget Categories</span>
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!budgets || budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">No budgets created yet</div>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Create your first budget
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const { spent, percentage } = getBudgetProgress(budget);
                const status = getBudgetStatus(percentage);

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
                          ${spent.toFixed(2)} / $
                          {parseFloat(budget.limit_amount).toFixed(2)}
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
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>
                        ${(parseFloat(budget.limit_amount) - spent).toFixed(2)}{" "}
                        remaining
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
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Set a spending limit for a specific category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Budget Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
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
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBudget}
              disabled={createBudgetMutation.isPending}
            >
              {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update the spending limit for this category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-amount">Budget Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-period">Period</Label>
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
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBudget}
              disabled={updateBudgetMutation.isPending}
            >
              {updateBudgetMutation.isPending ? "Updating..." : "Update Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Budget Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the budget for{" "}
              <strong>{selectedBudget?.category}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBudget}
              disabled={deleteBudgetMutation.isPending}
            >
              {deleteBudgetMutation.isPending ? "Deleting..." : "Delete Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

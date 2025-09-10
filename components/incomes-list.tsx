"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import type { Income, IncomeFilters } from "@/lib/types";
import { EditIncomeDialog } from "@/components/edit-income-dialog";
import { IncomesFilter } from "@/components/incomes-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Edit, Trash2, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useDeleteIncomesBulk } from "@/lib/hooks";

interface IncomesListProps {
  filters?: IncomeFilters;
}

export function IncomesList({ filters = {} }: IncomesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIncomes, setSelectedIncomes] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Filter state - now managed by IncomesFilter component
  const [activeFilters, setActiveFilters] = useState<IncomeFilters>({});

  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const bulkDeleteMutation = useDeleteIncomesBulk();
  
  // Combine external filters with active filters
  const combinedFilters = {
    ...filters,
    ...activeFilters,
  };

  // Handle filter changes from the filter component
  const handleFiltersChange = useCallback((newFilters: IncomeFilters) => {
    setActiveFilters(newFilters);
  }, []);

  const {
    data: incomes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["incomes", combinedFilters],
    queryFn: () => apiClient.getIncomes(combinedFilters),
  });

  // Derived helpers for selection
  const allSelectedOnPage = useMemo(
    () =>
      incomes.length > 0 &&
      incomes.every((income: Income) => selectedIncomes.has(income.id)),
    [incomes, selectedIncomes]
  );
  const someSelectedOnPage = useMemo(
    () =>
      incomes.some((income: Income) => selectedIncomes.has(income.id)) &&
      !allSelectedOnPage,
    [incomes, selectedIncomes, allSelectedOnPage]
  );

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIncomes((prev: Set<string>) => {
      const next = new Set(prev);
      if (checked) {
        incomes.forEach((income: Income) => next.add(income.id));
      } else {
        incomes.forEach((income: Income) => next.delete(income.id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIncomes((prev: Set<string>) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const {
    data: recurringIncomeSummary,
    isLoading: isSummaryLoading,
  } = useQuery({
    queryKey: ["recurring-income-summary"],
    queryFn: () => apiClient.getRecurringIncomeSummary(),
  });

  const {
    data: nonRecurringIncomeSummary,
    isLoading: isNonRecurringSummaryLoading,
  } = useQuery({
    queryKey: ["non-recurring-income-summary", combinedFilters.start_date, combinedFilters.end_date],
    queryFn: () => 
      apiClient.getNonRecurringIncomeSummary(
        combinedFilters.start_date,
        combinedFilters.end_date
      ),
  });

  const handleDeleteClick = (income: Income) => {
    setIncomeToDelete(income);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (income: Income) => {
    setIncomeToEdit(income);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!incomeToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteIncome(incomeToDelete.id);
      
      toast({
        title: t("incomes.delete.success.title"),
        description: t("incomes.delete.success.description"),
      });

      // Refresh the incomes list
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-income-summary"] });
      
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
    } catch (error: any) {
      console.error("Error deleting income:", error);
      toast({
        title: t("incomes.delete.error.title"),
        description: error.message || t("incomes.delete.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIncomes);
    if (ids.length === 0) return;

    try {
      const res = await bulkDeleteMutation.mutateAsync(ids);
      // Remove only successfully deleted from selection
      setSelectedIncomes((prev: Set<string>) => {
        const next = new Set(prev);
        res.successIds.forEach((sid: string) => next.delete(sid));
        return next;
      });
      // Refresh the incomes list
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-income-summary"] });
      queryClient.invalidateQueries({ queryKey: ["non-recurring-income-summary"] });
      setBulkDeleteDialogOpen(false);
    } catch (e) {
      // Error toasts handled in hook
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-[120px]" />
                <Skeleton className="h-3 w-[80px] mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            {t("incomes.error.loading")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <IncomesFilter
        onFiltersChange={handleFiltersChange}
        initialFilters={activeFilters}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Recurring Incomes Summary */}
        {!isSummaryLoading && recurringIncomeSummary && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("incomes.summary.totalRecurring")}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recurringIncomeSummary.total_recurring_incomes}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("incomes.summary.activeRecurring")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("incomes.summary.monthlyTotal")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(recurringIncomeSummary.total_monthly_amount.toString(), "USD")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("incomes.summary.fromRecurring")}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Non-recurring Incomes Summary */}
        {!isNonRecurringSummaryLoading && nonRecurringIncomeSummary && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("incomes.summary.totalNonRecurring")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nonRecurringIncomeSummary.total_non_recurring_incomes}
                </div>
                <p className="text-xs text-muted-foreground">
                  {combinedFilters.start_date || combinedFilters.end_date
                    ? t("incomes.summary.inPeriod")
                    : t("incomes.summary.allTime")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("incomes.summary.nonRecurringTotal")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(nonRecurringIncomeSummary.total_amount.toString(), "USD")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {combinedFilters.start_date || combinedFilters.end_date
                    ? t("incomes.summary.forPeriod")
                    : t("incomes.summary.totalReceived")}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Incomes Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("incomes.list.title")}</CardTitle>
          {selectedIncomes.size > 0 && (
            <Button
              variant="destructive"
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={bulkDeleteMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleteMutation.isPending
                ? t("common.deleting")
                : t("incomes.bulkDelete.selected", {
                    count: selectedIncomes.size,
                  })}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t("incomes.list.empty")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        allSelectedOnPage
                          ? true
                          : someSelectedOnPage
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                      aria-label={t("incomes.aria.selectAllPage")}
                    />
                  </TableHead>
                  <TableHead>{t("incomes.table.description")}</TableHead>
                  <TableHead>{t("incomes.table.amount")}</TableHead>
                  <TableHead>{t("incomes.table.date")}</TableHead>
                  <TableHead>{t("incomes.table.type")}</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="w-10">
                      <Checkbox
                        checked={selectedIncomes.has(income.id)}
                        onCheckedChange={(v) =>
                          toggleSelectOne(income.id, Boolean(v))
                        }
                        aria-label={t("incomes.aria.selectIncome", {
                          description: income.description,
                        })}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {income.description}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(income.amount, income.currency)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(income.income_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {income.is_recurring ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <Calendar className="w-3 h-3 mr-1" />
                          {t("incomes.recurring")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {t("incomes.oneTime")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(income)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(income)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("incomes.delete.confirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("incomes.delete.confirm.description")}
              {incomeToDelete && (
                <span className="font-medium">
                  {" "}{incomeToDelete.description}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Income Dialog */}
      <EditIncomeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        income={incomeToEdit}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("incomes.bulkDelete.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("incomes.bulkDelete.confirmDescription", {
                count: selectedIncomes.size,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-sm text-muted-foreground">
            <p className="text-amber-600 font-medium">
              ⚠️ {t("incomes.bulkDelete.warning")}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending
                ? t("incomes.bulkDelete.deleting")
                : t("incomes.bulkDelete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
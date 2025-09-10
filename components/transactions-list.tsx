"use client";

import { BulkDeleteTransactionsDialog } from "@/components/bulk-delete-transactions-dialog";
import { CategorySelect } from "@/components/category-select";
import { DeleteTransactionDialog } from "@/components/delete-transaction-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate as formatDateIntl, formatNumber, formatMoney } from "@/lib/format";
import {
  useCards,
  useCategoryColors,
  useCategories,
  useTransactions,
  useUpdateTransaction,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { TransactionFilters } from "@/lib/types";
import { Transaction } from "@/lib/types";
import {
  MessageSquare,
  MoreHorizontal,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface TransactionsListProps {
  filters?: TransactionFilters;
  searchQuery?: string;
  currency?: string; // Add currency filter
}

export function TransactionsList({
  filters,
  searchQuery: externalSearchQuery,
  currency,
}: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    [],
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingMerchant, setEditingMerchant] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { t, locale } = useI18n();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const { data: transactions, isLoading, error } = useTransactions(filters);
  const { data: cards } = useCards();
  const { data: categories } = useCategories();
  const updateTransactionMutation = useUpdateTransaction();
  const { getCategoryBadgeStyle, getCategoryEmoji } = useCategoryColors();

  // Update search query when external search query changes
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Create a map of card IDs to card names for display
  const cardMap =
    cards?.reduce(
      (
        acc: Record<string, string>,
        card: { id: string; card_name: string },
      ) => {
        acc[card.id] = card.card_name;
        return acc;
      },
      {} as Record<string, string>,
    ) || {};

  // Filter transactions based on search query and currency
  const filteredTransactions =
    transactions?.filter((transaction: Transaction) => {
      // Search filter
      const merchant = (transaction.merchant || "").toLowerCase();
      const category = (transaction.category || "").toLowerCase();
      const description = (transaction.description || "").toLowerCase();
      const query = (searchQuery || "").toLowerCase();
      const matchesSearch =
        merchant.includes(query) ||
        category.includes(query) ||
        description.includes(query);

      // Currency filter
      const matchesCurrency = !currency || transaction.currency === currency;

      return matchesSearch && matchesCurrency;
    }) || [];

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, currency]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
  };

  const getInitials = (merchant: string) => {
    const safe = (merchant || "?").trim();
    return safe
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Multi-select functionality
  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev: string[]) => [...prev, transactionId]);
    } else {
      setSelectedTransactions((prev: string[]) =>
        prev.filter((id: string) => id !== transactionId),
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all transactions on the current page
      const currentPageIds = paginatedTransactions.map(
        (t: Transaction) => t.id,
      );
      setSelectedTransactions((prev: string[]) => [
        ...prev.filter((id: string) => !currentPageIds.includes(id)), // Keep selections from other pages
        ...currentPageIds, // Add all from current page
      ]);
    } else {
      // Deselect all transactions on the current page
      const currentPageIds = paginatedTransactions.map(
        (t: Transaction) => t.id,
      );
      setSelectedTransactions((prev: string[]) =>
        prev.filter((id: string) => !currentPageIds.includes(id)),
      );
    }
  };

  const getSelectedTransactions = () => {
    return filteredTransactions.filter((t: Transaction) =>
      selectedTransactions.includes(t.id),
    );
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.length > 0) {
      setBulkDeleteOpen(true);
    }
  };

  const handleBulkDeleteSuccess = () => {
    setSelectedTransactions([]);
  };

  // Handler function for unified editing
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditingCategory(transaction.category || "");
    setEditingDescription(transaction.description || "");
    setEditingMerchant(transaction.merchant || "");
    setEditDialogOpen(true);
  };

  const handleSaveTransaction = async () => {
    if (!editingTransaction) return;

    // Validate required fields
    if (!editingMerchant.trim()) {
      setValidationError(t("transactions.validation.merchantRequired"));
      return;
    }

    setValidationError("");

    try {
      await updateTransactionMutation.mutateAsync({
        transactionId: editingTransaction.id,
        data: { 
          category: editingCategory,
          description: editingDescription,
          merchant: editingMerchant
        },
      });
      setEditDialogOpen(false);
      setEditingTransaction(null);
      setValidationError("");
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("transactions.recent.title")}</CardTitle>
          <CardDescription>{t("transactions.recent.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("transactions.loadFailed")}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t("common.retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>{t("transactions.all.title")}</CardTitle>
              <CardDescription>
                {t("transactions.all.subtitle")}
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-full md:w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <Skeleton className="h-4 w-[100px]" />
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{t("transactions.all.title")}</CardTitle>
            <CardDescription>
              {totalItems === 0
                ? t("transactions.empty")
                : t("transactions.header.showing", {
                    count: String(totalItems),
                  })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedTransactions.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("transactions.bulkDelete.selected", {
                  count: String(selectedTransactions.length),
                })}
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("transactions.itemsPerPage")}:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("transactions.searchPlaceholder")}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("transactions.empty")}</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          paginatedTransactions.length > 0 &&
                          paginatedTransactions.every((transaction) =>
                            selectedTransactions.includes(transaction.id),
                          )
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label={t("transactions.aria.selectAllPage")}
                      />
                    </TableHead>
                    <TableHead className="min-w-[200px]">{t("transactions.table.description")}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("transactions.table.date")}</TableHead>
                    <TableHead className="whitespace-nowrap w-[1%]">{t("transactions.table.category")}</TableHead>
                    <TableHead className="min-w-[120px]">{t("transactions.table.card")}</TableHead>
                    <TableHead className="whitespace-nowrap text-center">{t("transactions.table.currency")}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      {t("transactions.table.amount")}
                    </TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(
                            transaction.id,
                          )}
                          onCheckedChange={(checked) =>
                            handleSelectTransaction(
                              transaction.id,
                              checked as boolean,
                            )
                          }
                          aria-label={t("transactions.aria.selectTransaction", {
                            merchant: transaction.merchant,
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(transaction.merchant)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {transaction.description || transaction.merchant}
                            </p>
                            {transaction.description && transaction.merchant && (
                              <p className="text-xs text-muted-foreground">
                                {transaction.merchant}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateIntl(transaction.transaction_date, locale)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap w-[1%]">
                        {transaction.category ? (
                          <Badge
                            variant="secondary"
                            style={getCategoryBadgeStyle(transaction.category)}
                            className="px-2 py-1 h-6 text-xs"
                          >
                            {transaction.category}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t("transactions.uncategorized")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {cardMap[transaction.card_id] ||
                          t("transactions.unknownCard")}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant="outline" className="text-xs">
                          {transaction.currency}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">
                        -
                        {formatNumber(
                          parseFloat(transaction.amount),
                          locale,
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">
                                {t("common.actions")}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog
                              open={editDialogOpen}
                              onOpenChange={setEditDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleEditTransaction(transaction);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <Tag className="h-4 w-4" />
                                  {t("transactions.editTransaction")}
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>
                                    {t("transactions.editTransactionTitle")}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {t("transactions.editTransactionDesc")}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="merchant">
                                      {t("transactions.merchantLabel")}
                                    </Label>
                                    <Input
                                      id="merchant"
                                      value={editingMerchant}
                                      onChange={(e) =>
                                        setEditingMerchant(e.target.value)
                                      }
                                      placeholder={t(
                                        "transactions.merchantPlaceholder",
                                      )}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="category">
                                      {t("transactions.categoryLabel")}
                                    </Label>
                                    <CategorySelect
                                      value={editingCategory}
                                      onValueChange={setEditingCategory}
                                      placeholder={t(
                                        "transactions.searchCategoryPlaceholder",
                                      )}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="description">
                                      {t("transactions.descriptionLabel")}
                                    </Label>
                                    <Textarea
                                      id="description"
                                      value={editingDescription}
                                      onChange={(e) =>
                                        setEditingDescription(e.target.value)
                                      }
                                      placeholder={t(
                                        "transactions.descriptionPlaceholder",
                                      )}
                                      rows={2}
                                    />
                                  </div>
                                  
                                  {editingTransaction && (
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      <p>
                                        <strong>
                                          {t("transactions.info.amountLabel")}:
                                        </strong>{" "}
                                        {formatMoney(
                                          parseFloat(editingTransaction.amount),
                                          editingTransaction.currency as any,
                                          locale,
                                        )}
                                      </p>
                                      <p>
                                        <strong>
                                          {t("transactions.info.dateLabel")}:
                                        </strong>{" "}
                                        {formatDateIntl(editingTransaction.transaction_date, locale)}
                                      </p>
                                    </div>
                                  )}
                                  {validationError && (
                                    <div className="text-sm text-red-600 dark:text-red-400">
                                      {validationError}
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(false)}
                                  >
                                    {t("common.cancel")}
                                  </Button>
                                  <Button
                                    type="submit"
                                    onClick={handleSaveTransaction}
                                    disabled={
                                      updateTransactionMutation.isPending
                                    }
                                  >
                                    {updateTransactionMutation.isPending
                                      ? t("common.saving")
                                      : t("common.saveChanges")}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <DeleteTransactionDialog transaction={transaction}>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                }}
                                className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400 hover:text-red-600 focus:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("transactions.delete")}
                              </DropdownMenuItem>
                            </DeleteTransactionDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  {t("transactions.pagination.range", {
                    from: String(startIndex + 1),
                    to: String(Math.min(endIndex, totalItems)),
                    total: String(totalItems),
                  })}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else {
                        if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>

      <BulkDeleteTransactionsDialog
        transactions={getSelectedTransactions()}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onSuccess={handleBulkDeleteSuccess}
      />
    </Card>
  );
}

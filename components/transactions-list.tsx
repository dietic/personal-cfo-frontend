"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  MoreHorizontal,
  Search,
  Tag,
  MessageSquare,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { useTransactions, useCards, useUpdateTransaction } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { CategorySelect } from "@/components/category-select";
import { DeleteTransactionDialog } from "@/components/delete-transaction-dialog";
import { BulkDeleteTransactionsDialog } from "@/components/bulk-delete-transactions-dialog";
import type { TransactionFilters } from "@/lib/types";

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
    []
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const { data: transactions, isLoading, error } = useTransactions(filters);
  const { data: cards } = useCards();
  const updateTransactionMutation = useUpdateTransaction();

  // Update search query when external search query changes
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Create a map of card IDs to card names for display
  const cardMap =
    cards?.reduce((acc, card) => {
      acc[card.id] = card.card_name;
      return acc;
    }, {} as Record<string, string>) || {};

  // Filter transactions based on search query and currency
  const filteredTransactions =
    transactions?.filter((transaction) => {
      // Search filter
      const matchesSearch =
        transaction.merchant
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.category
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Currency filter
      const matchesCurrency = !currency || transaction.currency === currency;

      return matchesSearch && matchesCurrency;
    }) || [];

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

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

  const formatAmount = (amount: string, currency: string) => {
    const formattedAmount = parseFloat(amount).toFixed(2);
    // Display currency symbol or code based on currency
    const currencySymbol =
      currency === "USD" ? "$" : currency === "PEN" ? "S/" : currency + " ";
    return `${currencySymbol}${formattedAmount}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return "secondary";

    const colors: Record<string, string> = {
      groceries: "bg-green-100 text-green-800",
      dining: "bg-orange-100 text-orange-800",
      transport: "bg-blue-100 text-blue-800",
      shopping: "bg-purple-100 text-purple-800",
      entertainment: "bg-pink-100 text-pink-800",
      utilities: "bg-gray-100 text-gray-800",
      healthcare: "bg-red-100 text-red-800",
    };

    return colors[category.toLowerCase()] || "secondary";
  };

  const getInitials = (merchant: string) => {
    return merchant
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Multi-select functionality
  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev) => [...prev, transactionId]);
    } else {
      setSelectedTransactions((prev) =>
        prev.filter((id) => id !== transactionId)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all transactions on the current page
      const currentPageIds = paginatedTransactions.map((t) => t.id);
      setSelectedTransactions(prev => [
        ...prev.filter(id => !currentPageIds.includes(id)), // Keep selections from other pages
        ...currentPageIds // Add all from current page
      ]);
    } else {
      // Deselect all transactions on the current page
      const currentPageIds = paginatedTransactions.map((t) => t.id);
      setSelectedTransactions(prev => 
        prev.filter(id => !currentPageIds.includes(id))
      );
    }
  };

  const getSelectedTransactions = () => {
    return filteredTransactions.filter((t) =>
      selectedTransactions.includes(t.id)
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

  // Handler functions for editing
  const handleEditCategory = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditingCategory(transaction.category || "");
    setCategoryDialogOpen(true);
  };

  const handleEditDescription = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditingDescription(transaction.description || "");
    setDescriptionDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!editingTransaction) return;

    try {
      await updateTransactionMutation.mutateAsync({
        transactionId: editingTransaction.id,
        data: { category: editingCategory },
      });
      setCategoryDialogOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleSaveDescription = async () => {
    if (!editingTransaction) return;

    try {
      await updateTransactionMutation.mutateAsync({
        transactionId: editingTransaction.id,
        data: { description: editingDescription },
      });
      setDescriptionDialogOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Failed to update description:", error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Track and categorize your recent spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load transactions</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
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
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                View and manage your transaction history
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
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              {totalItems === 0 
                ? "No transactions found" 
                : `Showing ${totalItems} transaction${totalItems === 1 ? '' : 's'}`
              }
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
                Delete Selected ({selectedTransactions.length})
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
                placeholder="Search transactions..."
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
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          paginatedTransactions.length > 0 &&
                          paginatedTransactions.every(transaction =>
                            selectedTransactions.includes(transaction.id)
                          )
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all transactions on this page"
                      />
                    </TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onCheckedChange={(checked) =>
                          handleSelectTransaction(
                            transaction.id,
                            checked as boolean
                          )
                        }
                        aria-label={`Select transaction from ${transaction.merchant}`}
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
                          <p className="font-medium">{transaction.merchant}</p>
                          {transaction.description && (
                            <p className="text-xs text-muted-foreground">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.transaction_date)}
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(transaction.category)}
                        >
                          {transaction.category}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sin categoría
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cardMap[transaction.card_id] || "Unknown Card"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {transaction.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      -{formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog
                            open={categoryDialogOpen}
                            onOpenChange={setCategoryDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleEditCategory(transaction);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Tag className="h-4 w-4" />
                                Edit Category
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>
                                  Select a category for this transaction from
                                  the dropdown below.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="category">Category</Label>
                                  <CategorySelect
                                    value={editingCategory}
                                    onValueChange={setEditingCategory}
                                    placeholder="Search and select a category..."
                                  />
                                </div>
                                {editingTransaction && (
                                  <div className="text-sm text-muted-foreground">
                                    <p>
                                      <strong>Transaction:</strong>{" "}
                                      {editingTransaction.merchant}
                                    </p>
                                    <p>
                                      <strong>Amount:</strong> $
                                      {editingTransaction.amount}
                                    </p>
                                    <p>
                                      <strong>Current Category:</strong>{" "}
                                      {editingTransaction.category || "None"}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setCategoryDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  onClick={handleSaveCategory}
                                  disabled={updateTransactionMutation.isPending}
                                >
                                  {updateTransactionMutation.isPending
                                    ? "Saving..."
                                    : "Save Changes"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={descriptionDialogOpen}
                            onOpenChange={setDescriptionDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleEditDescription(transaction);
                                }}
                                className="flex items-center gap-2"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Edit Description
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Description</DialogTitle>
                                <DialogDescription>
                                  Add or edit the description for this
                                  transaction.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="description">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="description"
                                    value={editingDescription}
                                    onChange={(e) =>
                                      setEditingDescription(e.target.value)
                                    }
                                    placeholder="Add your description here..."
                                    rows={3}
                                  />
                                </div>
                                {editingTransaction && (
                                  <div className="text-sm text-muted-foreground">
                                    <p>
                                      <strong>Transaction:</strong>{" "}
                                      {editingTransaction.merchant}
                                    </p>
                                    <p>
                                      <strong>Amount:</strong> $
                                      {editingTransaction.amount}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setDescriptionDialogOpen(false)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  onClick={handleSaveDescription}
                                  disabled={updateTransactionMutation.isPending}
                                >
                                  {updateTransactionMutation.isPending
                                    ? "Saving..."
                                    : "Save Description"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <DeleteTransactionDialog transaction={transaction}>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                              }}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Transaction
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
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} transactions
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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

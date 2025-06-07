"use client";

import { useState } from "react";
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
import { MoreHorizontal, Search, Tag, MessageSquare } from "lucide-react";
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
import { useTransactions, useCards } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";

export function TransactionsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: transactions, isLoading, error } = useTransactions();
  const { data: cards } = useCards();

  // Create a map of card IDs to card names for display
  const cardMap =
    cards?.reduce((acc, card) => {
      acc[card.id] = card.card_name;
      return acc;
    }, {} as Record<string, string>) || {};

  // Filter transactions based on search query
  const filteredTransactions =
    transactions?.filter(
      (transaction) =>
        transaction.merchant
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.category
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  const formatAmount = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
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
              View and manage your transaction history
            </CardDescription>
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
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
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
                          Uncategorized
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cardMap[transaction.card_id] || "Unknown Card"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      -{formatAmount(transaction.amount)}
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
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
                                  Change the category for this transaction.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="category">Category</Label>
                                  <Input
                                    id="category"
                                    defaultValue={transaction.category || ""}
                                    placeholder="e.g. Groceries, Dining, Transportation"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
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
                                    defaultValue={transaction.description || ""}
                                    placeholder="Add your description here..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Save Description</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

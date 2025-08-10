"use client";

import { DeleteStatementDialog } from "@/components/delete-statement-dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCards,
  useDeleteStatementsBulk,
  useRecategorizeTransactions,
  useStatements,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { CategorizationRequest, Statement } from "@/lib/types";
import { format, parseISO } from "date-fns";
import {
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function StatementsList() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkRecategorizing, setBulkRecategorizing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string>("");
  const previousProcessingIdsRef = useRef<Set<string>>(new Set());

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Modal state for bulk delete confirm
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);

  const {
    data: statements,
    isLoading,
    error,
    refetch: refetchStatements,
  } = useStatements();
  const recategorizeMutation = useRecategorizeTransactions();
  const bulkDeleteMutation = useDeleteStatementsBulk();
  const { data: cards } = useCards();

  // Derived helpers for selection
  const baseStatements: Statement[] = statements ?? [];
  const filteredStatements: Statement[] = baseStatements.filter(
    (statement: Statement) =>
      statement.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (statement.status?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
  );

  const allSelectedOnPage = useMemo(
    () =>
      filteredStatements.length > 0 &&
      filteredStatements.every((s: Statement) => selectedIds.has(s.id)),
    [filteredStatements, selectedIds]
  );
  const someSelectedOnPage = useMemo(
    () =>
      filteredStatements.some((s: Statement) => selectedIds.has(s.id)) &&
      !allSelectedOnPage,
    [filteredStatements, selectedIds, allSelectedOnPage]
  );

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (checked) {
        filteredStatements.forEach((s: Statement) => next.add(s.id));
      } else {
        filteredStatements.forEach((s: Statement) => next.delete(s.id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Auto-refresh when there are processing statements
  useEffect(() => {
    const hasProcessingStatements = statements?.some(
      (statement: Statement) =>
        statement.status === "processing" || statement.status === "uploaded"
    );

    if (hasProcessingStatements) {
      const interval = setInterval(() => {
        refetchStatements();
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [statements]); // Remove refetchStatements from dependencies

  // Clear selection if items disappear
  useEffect(() => {
    if (!statements) return;
    setSelectedIds((prev: Set<string>) => {
      const next = new Set<string>();
      for (const id of prev) {
        if ((statements as Statement[]).find((s: Statement) => s.id === id))
          next.add(id);
      }
      return next;
    });
  }, [statements]);

  // Notify when statements complete processing
  useEffect(() => {
    if (statements) {
      const currentProcessingIds = new Set(
        (statements as Statement[])
          .filter(
            (s: Statement) =>
              s.status === "processing" || s.status === "uploaded"
          )
          .map((s: Statement) => s.id)
      );

      // Check for newly completed statements
      const completedStatements = (statements as Statement[]).filter(
        (statement: Statement) => {
          const wasProcessing = previousProcessingIdsRef.current.has(
            statement.id
          );
          const isNowCompleted = statement.status === "completed";
          return wasProcessing && isNowCompleted;
        }
      );

      // Show notifications for completed statements
      completedStatements.forEach((statement: Statement) => {
        toast.success(
          t("statements.toast.completed", { filename: statement.filename })
        );
      });

      // Check for failed statements
      const failedStatements = (statements as Statement[]).filter(
        (statement: Statement) => {
          const wasProcessing = previousProcessingIdsRef.current.has(
            statement.id
          );
          const isNowFailed =
            statement.status === "failed" || statement.status === "error";
          return wasProcessing && isNowFailed;
        }
      );

      failedStatements.forEach((statement: Statement) => {
        toast.error(
          t("statements.toast.failed", { filename: statement.filename })
        );
      });

      previousProcessingIdsRef.current = currentProcessingIds;
    }
  }, [statements]); // Remove previousProcessingIds from dependencies

  // Recategorize handler - processes existing transactions with updated keywords
  const handleRecategorizeTransactions = async (statement: Statement) => {
    try {
      const categorizationRequest: CategorizationRequest = {
        use_ai: false, // Only use keywords for recategorization to avoid AI costs
        use_keywords: true,
      };

      await recategorizeMutation.mutateAsync({
        statementId: statement.id,
        data: categorizationRequest,
      });

      // Refresh the statements list to show updated status
      await refetchStatements();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Recategorize error:", error);
    }
  };

  // Bulk recategorization handler - processes all statements regardless of status
  const handleBulkRecategorization = async () => {
    if (!statements) return;

    // Filter statements that have been processed (any status - we'll recategorize all)
    const eligibleStatements = (statements as Statement[]).filter(
      (statement: Statement) =>
        statement.status === "completed" || statement.status === "failed"
    );

    if (eligibleStatements.length === 0) {
      toast.info(t("statements.noEligibleForRecategorization"));
      return;
    }

    setBulkRecategorizing(true);
    setBulkProgress(0);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    const categorizationRequest: CategorizationRequest = {
      use_ai: false, // Only use keywords for bulk recategorization
      use_keywords: true,
    };

    // Process statements sequentially to avoid overwhelming the server
    for (const statement of eligibleStatements) {
      try {
        setCurrentProcessing(statement.filename);

        await recategorizeMutation.mutateAsync({
          statementId: statement.id,
          data: categorizationRequest,
        });

        successCount++;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to recategorize ${statement.filename}:`, error);
        errorCount++;
      }

      processedCount++;
      setBulkProgress((processedCount / eligibleStatements.length) * 100);
    }

    // Final refresh and cleanup
    await refetchStatements();
    setBulkRecategorizing(false);
    setBulkProgress(0);
    setCurrentProcessing("");

    // Show final result
    if (successCount > 0) {
      if (errorCount > 0) {
        toast.success(
          t("statements.bulkRecategorization.completedWithFailures", {
            success: successCount,
            failed: errorCount,
          })
        );
      } else {
        toast.success(
          t("statements.bulkRecategorization.completed", {
            success: successCount,
          })
        );
      }
    } else {
      toast.error(t("statements.bulkRecategorization.failedAll"));
    }
  };

  // Bulk delete handler (modal confirms separately)
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      const res = await bulkDeleteMutation.mutateAsync(ids);
      // Remove only successfully deleted from selection
      setSelectedIds((prev: Set<string>) => {
        const next = new Set(prev);
        res.successIds.forEach((sid: string) => next.delete(sid));
        return next;
      });
      await refetchStatements();
      setConfirmBulkOpen(false);
    } catch (e) {
      // Error toasts handled in hook
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "secondary";

    const colors: Record<string, string> = {
      uploaded: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      error: "bg-red-100 text-red-800",
    };

    return colors[status.toLowerCase()] || "secondary";
  };

  const renderStatusBadge = (statement: Statement) => {
    const status = statement.status?.toLowerCase();
    const isProcessing = status === "processing" || status === "uploaded";

    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={getStatusColor(statement.status)}>
          {isProcessing && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          {statement.status || t("statements.status.unknown")}
        </Badge>
        {isProcessing && (
          <span className="text-xs text-muted-foreground">
            {t("statements.status.processingNote")}
          </span>
        )}
      </div>
    );
  };

  const getCardName = (cardId?: string | null) => {
    if (!cardId || !cards) return "-";
    const card = (
      cards as Array<{ id: string; card_name?: string | null }>
    ).find((c: { id: string }) => c.id === cardId);
    return card?.card_name || "-";
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("statements.page.title")}</CardTitle>
          <CardDescription>{t("statements.page.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("statements.loadFailed")}
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
              <CardTitle>{t("statements.page.title")}</CardTitle>
              <CardDescription>
                {t("statements.page.description")}
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-full md:w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((id) => (
              <div
                key={`skeleton-${id}`}
                className="flex items-center space-x-4"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
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
            <CardTitle>{t("statements.page.title")}</CardTitle>
            <CardDescription>
              {t("statements.page.description")}
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Button
              variant="destructive"
              // Open modal instead of window.confirm
              onClick={() => setConfirmBulkOpen(true)}
              disabled={selectedIds.size === 0 || bulkDeleteMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleteMutation.isPending
                ? t("statements.deleting")
                : t("statements.bulkDelete.selected", {
                    count: selectedIds.size,
                  })}
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkRecategorization}
              disabled={bulkRecategorizing || isLoading || !statements?.length}
              className="flex items-center gap-2"
            >
              <RotateCcw
                className={`h-4 w-4 ${
                  bulkRecategorizing ? "animate-spin" : ""
                }`}
              />
              {bulkRecategorizing
                ? t("statements.recategorizing")
                : t("statements.recategorizeAll")}
            </Button>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("statements.searchPlaceholder")}
                className="pl-8"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                disabled={bulkRecategorizing}
              />
            </div>
          </div>
        </div>

        {/* Bulk recategorization progress */}
        {bulkRecategorizing && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("statements.bulkRecategorization.processing", {
                  filename: currentProcessing,
                })}
              </span>
              <span className="text-muted-foreground">
                {Math.round(bulkProgress)}%
              </span>
            </div>
            <Progress value={bulkProgress} className="w-full" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredStatements.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {statements?.length === 0
                ? t("statements.empty.noneUploaded")
                : t("statements.empty.noneFound")}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
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
                      aria-label={t("statements.aria.selectAllPage")}
                    />
                  </TableHead>
                  <TableHead>{t("statements.table.fileName")}</TableHead>
                  <TableHead>{t("statements.table.card")}</TableHead>
                  <TableHead>{t("statements.table.status")}</TableHead>
                  <TableHead>{t("statements.table.uploadDate")}</TableHead>
                  <TableHead>{t("statements.table.fileType")}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatements.map((statement) => (
                  <TableRow
                    key={statement.id}
                    data-state={
                      selectedIds.has(statement.id) ? "selected" : undefined
                    }
                  >
                    <TableCell className="w-10">
                      <Checkbox
                        checked={selectedIds.has(statement.id)}
                        onCheckedChange={(v) =>
                          toggleSelectOne(statement.id, Boolean(v))
                        }
                        aria-label={t("statements.aria.selectStatement", {
                          filename: statement.filename,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{statement.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("statements.idLabel")}:{" "}
                            {statement.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getCardName(statement.card_id)}
                      </span>
                    </TableCell>
                    <TableCell>{renderStatusBadge(statement)}</TableCell>
                    <TableCell>{formatDate(statement.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                        {statement.file_type || t("statements.fileType.pdf")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={bulkRecategorizing}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">
                              {t("common.actions")}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            disabled={true} // Download functionality can be implemented later
                          >
                            <Download className="h-4 w-4" />
                            {t("statements.menu.download")}
                          </DropdownMenuItem>

                          {/* Recategorize option - only show for completed statements */}
                          {statement.extraction_status === "completed" &&
                            statement.categorization_status === "completed" && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                disabled={
                                  recategorizeMutation.isPending ||
                                  bulkRecategorizing
                                }
                                onSelect={() =>
                                  handleRecategorizeTransactions(statement)
                                }
                              >
                                <RefreshCw className="h-4 w-4" />
                                {recategorizeMutation.isPending
                                  ? t("statements.menu.recategorizing")
                                  : t("statements.menu.recategorize")}
                              </DropdownMenuItem>
                            )}

                          <DeleteStatementDialog statement={statement}>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                              }}
                              className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400 hover:text-red-600 focus:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
                              disabled={bulkRecategorizing}
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("statements.menu.delete")}
                            </DropdownMenuItem>
                          </DeleteStatementDialog>
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

      {/* Bulk delete confirm modal */}
      <AlertDialog open={confirmBulkOpen} onOpenChange={setConfirmBulkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("statements.bulkDelete.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("statements.bulkDelete.confirmDescription", {
                count: selectedIds.size,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-sm text-muted-foreground">
            <p className="text-amber-600 font-medium">
              {/* keep emoji for emphasis, leave copy localized */}
              ⚠️ {t("statements.bulkDelete.warning")}
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
                ? t("statements.bulkDelete.deleting")
                : t("statements.bulkDelete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

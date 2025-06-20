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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  MoreHorizontal,
  Search,
  FileText,
  Trash2,
  Download,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStatements, useRecategorizeTransactions } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Statement, CategorizationRequest } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { DeleteStatementDialog } from "@/components/delete-statement-dialog";
import { toast } from "sonner";

export function StatementsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkRecategorizing, setBulkRecategorizing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string>("");

  const { data: statements, isLoading, error, refetch: refetchStatements } = useStatements();
  const recategorizeMutation = useRecategorizeTransactions();

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
      console.error("Recategorize error:", error);
    }
  };

  // Bulk recategorization handler - processes all completed statements
  const handleBulkRecategorization = async () => {
    if (!statements) return;

    // Filter statements that can be recategorized (completed extraction and categorization)
    const eligibleStatements = statements.filter(
      (statement) =>
        statement.extraction_status === "completed" &&
        statement.categorization_status === "completed"
    );

    if (eligibleStatements.length === 0) {
      toast.info("No statements available for recategorization");
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
      toast.success(
        `Bulk recategorization completed! ${successCount} statements processed successfully${
          errorCount > 0 ? `, ${errorCount} failed` : ""
        }`
      );
    } else {
      toast.error("Bulk recategorization failed for all statements");
    }
  };

  // Filter statements based on search query
  const filteredStatements =
    statements?.filter(
      (statement) =>
        statement.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statement.status?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Statements</CardTitle>
          <CardDescription>
            Manage your uploaded bank statements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load statements</p>
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
              <CardTitle>Bank Statements</CardTitle>
              <CardDescription>
                Manage your uploaded bank statements
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-full md:w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
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
            <CardTitle>Bank Statements</CardTitle>
            <CardDescription>
              Manage your uploaded bank statements
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Button
              variant="outline"
              onClick={handleBulkRecategorization}
              disabled={bulkRecategorizing || isLoading || !statements?.length}
              className="flex items-center gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${bulkRecategorizing ? "animate-spin" : ""}`} />
              {bulkRecategorizing ? "Recategorizing..." : "Recategorize All"}
            </Button>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search statements..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                Processing: {currentProcessing}
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
                ? "No statements uploaded yet"
                : "No statements found"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatements.map((statement) => (
                  <TableRow key={statement.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{statement.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {statement.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(statement.status)}
                      >
                        {statement.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(statement.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                        {statement.file_type || "PDF"}
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
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            disabled={true} // Download functionality can be implemented later
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </DropdownMenuItem>

                          {/* Recategorize option - only show for completed statements */}
                          {statement.extraction_status === "completed" &&
                            statement.categorization_status === "completed" && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                disabled={recategorizeMutation.isPending || bulkRecategorizing}
                                onSelect={() => handleRecategorizeTransactions(statement)}
                              >
                                <RefreshCw className="h-4 w-4" />
                                {recategorizeMutation.isPending ? "Recategorizing..." : "Recategorize"}
                              </DropdownMenuItem>
                            )}

                          <DeleteStatementDialog statement={statement}>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                              }}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                              disabled={bulkRecategorizing}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Statement
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
    </Card>
  );
}

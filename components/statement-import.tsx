"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  useCategorizeTransactions,
  useCheckPDFAccessibility,
  useExtractTransactions,
  useProcessStatement,
  useStatements,
  useStatementStatus,
  useUploadStatementAsync,
} from "@/lib/hooks";
import {
  CategorizationRequest,
  ExtractionRequest,
  Statement,
} from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertCircle,
  Brain,
  Eye,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  Tag,
  TrendingUp,
  Unlock,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function StatementImport() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatement, setProcessingStatement] = useState<string | null>(
    null
  );
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordFile, setPasswordFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const queryClient = useQueryClient();
  const { data: cards } = useCards();
  const { data: statements, refetch: refetchStatements } = useStatements();
  const uploadAsyncMutation = useUploadStatementAsync();
  const processMutation = useProcessStatement();
  const extractMutation = useExtractTransactions();
  const categorizeMutation = useCategorizeTransactions();
  const checkPDFMutation = useCheckPDFAccessibility();

  // Status polling for processing statements
  const { data: statusData } = useStatementStatus(
    processingStatement || "",
    !!processingStatement
  );

  // Stop polling when processing is complete
  useEffect(() => {
    if (statusData && processingStatement) {
      const isComplete =
        statusData.status === "completed" ||
        statusData.status === "failed" ||
        (statusData.extraction_status === "completed" &&
          statusData.categorization_status === "completed");

      if (isComplete) {
        setProcessingStatement(null);
        refetchStatements();

        // Invalidate transactions cache to refresh the transactions list
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["analytics"] });

        if (statusData.status === "completed") {
          toast.success("Statement processing completed successfully!");
        } else if (statusData.status === "failed") {
          toast.error("Statement processing failed. Please try again.");
        }
      }
    }
  }, [statusData, processingStatement, refetchStatements, queryClient]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a PDF file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Card selection is required for bank type detection
      if (!selectedCard) {
        toast.error("Please select a card first");
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(10);

        // First, check if PDF needs password
        console.log(
          "🔍 Checking PDF accessibility for file:",
          file.name,
          "Size:",
          file.size
        );

        let pdfStatus;
        try {
          pdfStatus = await checkPDFMutation.mutateAsync(file);
          console.log("✅ PDF Status received:", pdfStatus);
        } catch (checkError) {
          console.error("❌ PDF check failed:", checkError);
          // If PDF check fails, assume it's not password protected and continue
          console.log("⚠️ PDF check failed, assuming not password protected");
          pdfStatus = { accessible: true, encrypted: false, pages: 0 };
        }

        setUploadProgress(20);

        if (pdfStatus.encrypted && !pdfStatus.accessible) {
          // PDF is password protected - show password dialog
          console.log("🔒 PDF is password protected, showing password dialog");
          console.log("📄 PDF Status:", pdfStatus);
          setPasswordFile(file);
          setShowPasswordDialog(true);
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        console.log("📖 PDF is accessible, proceeding with async upload...");
        console.log("📄 PDF Status:", pdfStatus);
        setUploadProgress(30);

        // Use the async upload method for unprotected PDFs
        const result = await uploadAsyncMutation.mutateAsync({
          file,
          cardId: selectedCard,
        });
        console.log("✅ Async upload successful, result:", result);

        setUploadProgress(50);

        // Start polling for processing status
        setProcessingStatement(result.id);

        setUploadProgress(100);

        // Refresh statements list
        await refetchStatements();

        // Show success message and redirect to statements page
        toast.success(
          `Statement "${result.filename}" is being processed in the background. You'll be notified when it's complete.`
        );

        // Redirect to statements page immediately
        router.push("/statements");
      } catch (error: any) {
        console.error("Upload error:", error);

        let errorMessage = "Failed to process statement";

        // Handle specific error cases
        if (error.response?.status === 423) {
          // PDF is password protected but we missed it somehow
          setPasswordFile(file);
          setShowPasswordDialog(true);
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 2000);
      }
    },
    [selectedCard, uploadAsyncMutation, checkPDFMutation, refetchStatements]
  );

  const handlePasswordSubmit = async () => {
    if (!passwordFile || !password.trim() || !selectedCard) {
      toast.error("Please provide all required information");
      return;
    }

    try {
      setIsUnlocking(true);

      console.log("Attempting to unlock and process PDF with password...");
      const result = await uploadAsyncMutation.mutateAsync({
        file: passwordFile,
        cardId: selectedCard,
        password: password.trim(),
      });

      console.log("✅ PDF uploaded and processing started");

      // Start polling for processing status
      setProcessingStatement(result.id);

      // Close dialog and reset state
      setShowPasswordDialog(false);
      setPasswordFile(null);
      setPassword("");

      // Refresh statements list
      await refetchStatements();

      // Show success message and redirect to statements page
      toast.success(
        `Statement "${result.filename}" is being processed in the background. You'll be notified when it's complete.`
      );

      // Redirect to statements page immediately
      router.push("/statements");
    } catch (error: any) {
      console.error("Unlock error:", error);
      let errorMessage = "Failed to unlock PDF";
      if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordDialog(false);
    setPasswordFile(null);
    setPassword("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      void onDrop(files);
    },
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleProcessStatement = async (statement: Statement) => {
    if (!selectedCard) {
      toast.error("Please select a card first");
      return;
    }

    try {
      const result = await processMutation.mutateAsync({
        statementId: statement.id,
        cardId: selectedCard,
      });

      toast.success(
        `Statement processed! Found ${result.transactions_found} transactions, created ${result.transactions_created} new ones.`
      );

      // Refresh statements list
      await refetchStatements();
    } catch (error) {
      console.error("Process error:", error);
      toast.error("Failed to process statement");
    }
  };

  // New step-by-step processing handlers
  const handleExtractTransactions = async (statement: Statement) => {
    if (!selectedCard) {
      toast.error("Please select a card first");
      return;
    }

    try {
      setProcessingStatement(statement.id);

      const extractionRequest: ExtractionRequest = {
        card_id: selectedCard,
        card_name: cards?.find((c) => c.id === selectedCard)?.card_name,
        statement_month: null,
      };

      await extractMutation.mutateAsync({
        statementId: statement.id,
        data: extractionRequest,
      });

      // Status will be polled automatically
    } catch (error) {
      console.error("Extract error:", error);
      setProcessingStatement(null);
    }
  };

  const handleCategorizeTransactions = async (statement: Statement) => {
    if (!selectedCard) {
      toast.error("Please select a card first");
      return;
    }

    try {
      setProcessingStatement(statement.id);

      const categorizationRequest: CategorizationRequest = {
        use_ai: true,
        use_keywords: true,
      };

      await categorizeMutation.mutateAsync({
        statementId: statement.id,
        data: categorizationRequest,
      });

      // Status will be polled automatically
    } catch (error) {
      console.error("Categorize error:", error);
      setProcessingStatement(null);
    }
  };

  const handleRetryStep = async (statement: Statement, step: string) => {
    // Retry functionality temporarily disabled
    toast.info("Retry functionality will be available in a future update");
  };

  const getStatusBadge = (statement: Statement) => {
    if (statement.is_processed) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }

    // Handle the new multi-step statuses
    if (statement.status === "processing") {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    }

    if (statement.status === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    }

    if (
      statement.extraction_status === "completed" &&
      statement.categorization_status === "pending"
    ) {
      return <Badge className="bg-yellow-100 text-yellow-800">Extracted</Badge>;
    }

    if (statement.extraction_status === "processing") {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Extracting
        </Badge>
      );
    }

    if (statement.categorization_status === "processing") {
      return (
        <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Categorizing
        </Badge>
      );
    }

    return <Badge variant="secondary">Uploaded</Badge>;
  };

  const getProgressInfo = (statement: Statement) => {
    const currentStatus =
      processingStatement === statement.id ? statusData : null;

    if (!currentStatus) {
      if (statement.is_processed) return { percentage: 100, step: "Completed" };
      if (
        statement.extraction_status === "completed" &&
        statement.categorization_status === "pending"
      ) {
        return { percentage: 50, step: "Ready for Categorization" };
      }
      if (statement.extraction_status === "pending")
        return { percentage: 0, step: "Ready for Extraction" };
      return { percentage: 25, step: "Uploaded" };
    }

    return {
      percentage: currentStatus.progress_percentage || 0,
      step: currentStatus.current_step || "Processing",
    };
  };

  const getSimpleStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Statement
          </CardTitle>
          <CardDescription>
            Upload your bank statement in PDF format to automatically import
            transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Selection */}
          <div className="space-y-2">
            <Label htmlFor="card-select">Select Card *</Label>
            <Select value={selectedCard} onValueChange={setSelectedCard}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a card for this statement" />
              </SelectTrigger>
              <SelectContent>
                {cards?.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.card_name} ({card.bank_provider?.name || "Unknown"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Card selection is required to properly categorize and track
              transactions.
            </p>
          </div>

          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the PDF file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop a PDF file here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF files up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            PDF Format Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>Your PDF statement should be:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Text-based:</strong> Scanned images may not work
                properly
              </li>
              <li>
                <strong>Bank statement:</strong> Official statement from your
                bank
              </li>
              <li>
                <strong>Recent:</strong> Statements from the last 12 months work
                best
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              The system will automatically extract transaction data from the
              PDF.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statements History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statement History
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStatements()}
            >
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            View and manage your uploaded statements. All statements are
            associated with a card for proper transaction tracking and
            analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!statements || statements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No statements uploaded yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statements.map((statement) => {
                  const progressInfo = getProgressInfo(statement);
                  const isProcessing = processingStatement === statement.id;

                  return (
                    <TableRow key={statement.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span
                            className="font-medium truncate min-w-0 max-w-[180px]"
                            title={statement.filename}
                          >
                            {statement.filename}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(statement.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(statement)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{progressInfo.step}</span>
                            <span>{progressInfo.percentage}%</span>
                          </div>
                          <Progress
                            value={progressInfo.percentage}
                            className="h-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Show different actions based on statement status */}
                          {statement.extraction_status === "pending" &&
                            !isProcessing && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleExtractTransactions(statement)
                                }
                                disabled={
                                  !selectedCard || extractMutation.isPending
                                }
                                className="flex items-center gap-1"
                              >
                                <Brain className="h-3 w-3" />
                                Extract
                              </Button>
                            )}

                          {statement.extraction_status === "completed" &&
                            statement.categorization_status === "pending" &&
                            !isProcessing && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCategorizeTransactions(statement)
                                }
                                disabled={categorizeMutation.isPending}
                                className="flex items-center gap-1"
                              >
                                <Tag className="h-3 w-3" />
                                Categorize
                              </Button>
                            )}

                          {(statement.extraction_status === "failed" ||
                            statement.categorization_status === "failed") &&
                            !isProcessing && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRetryStep(
                                    statement,
                                    statement.extraction_status === "failed"
                                      ? "extract"
                                      : "categorize"
                                  )
                                }
                                disabled={false}
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Retry
                              </Button>
                            )}

                          {/* Legacy one-click process button */}
                          {!statement.is_processed &&
                            statement.status === "uploaded" &&
                            !isProcessing && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleProcessStatement(statement)
                                }
                                disabled={
                                  !selectedCard || processMutation.isPending
                                }
                                className="flex items-center gap-1"
                              >
                                <TrendingUp className="h-3 w-3" />
                                Process All
                              </Button>
                            )}

                          {isProcessing && (
                            <Button
                              size="sm"
                              disabled
                              className="flex items-center gap-1"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing...
                            </Button>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Insights functionality temporarily disabled
                                  // setSelectedStatement(statement);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                {statement.is_processed
                                  ? "View Insights"
                                  : "View Details"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle
                                  className="truncate"
                                  title={`Statement Details - ${statement.filename}`}
                                >
                                  Statement Details - {statement.filename}
                                </DialogTitle>
                                <DialogDescription>
                                  Uploaded{" "}
                                  {formatDistanceToNow(
                                    parseISO(statement.created_at)
                                  )}{" "}
                                  ago
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* Statement Status */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Status
                                    </Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getStatusBadge(statement)}
                                      <span className="text-sm text-muted-foreground">
                                        {statement.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Processing Progress
                                    </Label>
                                    <div className="mt-1">
                                      <Progress
                                        value={
                                          getProgressInfo(statement).percentage
                                        }
                                        className="h-2"
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        {getProgressInfo(statement).percentage}%
                                        complete -{" "}
                                        {getProgressInfo(statement).step}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Error Messages */}
                                {statement.error_message && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-destructive">
                                      Error Details
                                    </Label>
                                    <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                                      <p className="text-sm text-destructive">
                                        {statement.error_message}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Processing Details */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Extraction Status
                                    </Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getSimpleStatusBadge(
                                        statement.extraction_status
                                      )}
                                      <span className="text-muted-foreground">
                                        {statement.extraction_status}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Categorization Status
                                    </Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getSimpleStatusBadge(
                                        statement.categorization_status
                                      )}
                                      <span className="text-muted-foreground">
                                        {statement.categorization_status}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Retry Information */}
                                {parseInt(statement.retry_count) > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Retry Count
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      This statement has been retried{" "}
                                      {statement.retry_count} time(s)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Password Dialog for Protected PDFs */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              PDF Password Required
            </DialogTitle>
            <DialogDescription>
              This PDF is password protected. Please enter the password to
              unlock and process it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-password">Password</Label>
              <Input
                id="pdf-password"
                type="password"
                placeholder="Enter PDF password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>

            {passwordFile && (
              <div className="text-sm text-muted-foreground">
                File: {passwordFile.name}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handlePasswordCancel}
                disabled={isUnlocking}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                disabled={!password.trim() || isUnlocking}
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock & Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

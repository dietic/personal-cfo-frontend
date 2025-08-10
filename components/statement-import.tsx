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
import { useI18n } from "@/lib/i18n";
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
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function StatementImport() {
  const router = useRouter();
  const { t } = useI18n();
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
          toast.success(t("import.toast.processingCompleted"));
        } else if (statusData.status === "failed") {
          toast.error(t("import.toast.processingFailed"));
        }
      }
    }
  }, [statusData, processingStatement, refetchStatements, queryClient, t]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error(t("import.errors.pdfOnly"));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("import.errors.maxSize"));
        return;
      }

      // Card selection is required for bank type detection
      if (!selectedCard) {
        toast.error(t("import.errors.selectCardFirst"));
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(10);

        let pdfStatus;
        try {
          pdfStatus = await checkPDFMutation.mutateAsync(file);
        } catch {
          // If PDF check fails, assume it's not password protected and continue
          pdfStatus = { accessible: true, encrypted: false, pages: 0 } as any;
        }

        setUploadProgress(20);

        if (pdfStatus.encrypted && !pdfStatus.accessible) {
          setPasswordFile(file);
          setShowPasswordDialog(true);
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        setUploadProgress(30);

        // Use the async upload method for unprotected PDFs
        const result = await uploadAsyncMutation.mutateAsync({
          file,
          cardId: selectedCard,
        });

        setUploadProgress(50);

        // Start polling for processing status
        setProcessingStatement(result.id);

        setUploadProgress(100);

        // Refresh statements list
        await refetchStatements();

        // Show success message and redirect to statements page
        toast.success(
          t("import.toast.processingStarted", { filename: result.filename })
        );

        // Redirect to statements page immediately
        router.push("/statements");
      } catch (error: any) {
        let errorMessage = t("import.errors.failedToProcess");
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
    [
      selectedCard,
      uploadAsyncMutation,
      checkPDFMutation,
      refetchStatements,
      router,
      t,
    ]
  );

  const handlePasswordSubmit = async () => {
    if (!passwordFile || !password.trim() || !selectedCard) {
      toast.error(t("import.errors.provideAll"));
      return;
    }

    try {
      setIsUnlocking(true);

      const result = await uploadAsyncMutation.mutateAsync({
        file: passwordFile,
        cardId: selectedCard,
        password: password.trim(),
      });

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
        t("import.toast.processingStarted", { filename: result.filename })
      );

      // Redirect to statements page immediately
      router.push("/statements");
    } catch (error: any) {
      let errorMessage = t("pdf.unlockFailed");
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
      toast.error(t("import.errors.selectCardFirst"));
      return;
    }

    try {
      const result = await processMutation.mutateAsync({
        statementId: statement.id,
        cardId: selectedCard,
      });

      toast.success(
        t("import.toast.processedSummary", {
          found: result.transactions_found,
          created: result.transactions_created,
        })
      );

      // Refresh statements list
      await refetchStatements();
    } catch (error) {
      toast.error(t("import.errors.failedToProcess"));
    }
  };

  // New step-by-step processing handlers
  const handleExtractTransactions = async (statement: Statement) => {
    if (!selectedCard) {
      toast.error(t("import.errors.selectCardFirst"));
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
    } catch {
      setProcessingStatement(null);
    }
  };

  const handleCategorizeTransactions = async (statement: Statement) => {
    if (!selectedCard) {
      toast.error(t("import.errors.selectCardFirst"));
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
    } catch {
      setProcessingStatement(null);
    }
  };

  const handleRetryStep = async () => {
    toast.info(t("import.retry.placeholder"));
  };

  const getStatusBadge = (statement: Statement) => {
    if (statement.is_processed) {
      return (
        <Badge className="bg-green-100 text-green-800">
          {t("import.status.completed")}
        </Badge>
      );
    }

    if (statement.status === "processing") {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("import.status.processing")}
        </Badge>
      );
    }

    if (statement.status === "failed") {
      return <Badge variant="destructive">{t("import.status.failed")}</Badge>;
    }

    if (
      statement.extraction_status === "completed" &&
      statement.categorization_status === "pending"
    ) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          {t("import.status.extracted")}
        </Badge>
      );
    }

    if (statement.extraction_status === "processing") {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("import.status.extracting")}
        </Badge>
      );
    }

    if (statement.categorization_status === "processing") {
      return (
        <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("import.status.categorizing")}
        </Badge>
      );
    }

    return <Badge variant="secondary">{t("import.status.uploaded")}</Badge>;
  };

  const getProgressInfo = (statement: Statement) => {
    const currentStatus =
      processingStatement === statement.id ? statusData : null;

    if (!currentStatus) {
      if (statement.is_processed)
        return { percentage: 100, step: t("import.status.completed") };
      if (
        statement.extraction_status === "completed" &&
        statement.categorization_status === "pending"
      ) {
        return {
          percentage: 50,
          step: t("import.info.readyForCategorization"),
        };
      }
      if (statement.extraction_status === "pending")
        return { percentage: 0, step: t("import.info.readyForExtraction") };
      return { percentage: 25, step: t("import.status.uploaded") };
    }

    return {
      percentage: currentStatus.progress_percentage || 0,
      step: currentStatus.current_step || t("import.status.processing"),
    };
  };

  const getSimpleStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            {t("import.status.completed")}
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("import.status.processing")}
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">{t("import.status.failed")}</Badge>;
      case "pending":
        return <Badge variant="secondary">{t("import.status.pending")}</Badge>;
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
            {t("import.upload.title")}
          </CardTitle>
          <CardDescription>{t("import.upload.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Selection */}
          <div className="space-y-2">
            <Label htmlFor="card-select">{t("import.selectCard")}</Label>
            <Select value={selectedCard} onValueChange={setSelectedCard}>
              <SelectTrigger>
                <SelectValue placeholder={t("import.selectCardPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {cards?.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.card_name} (
                    {card.bank_provider?.name || t("common.unknown")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("import.cardHelp")}
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
              <p className="text-lg">{t("import.drop.active")}</p>
            ) : (
              <div>
                <p className="text-lg mb-2">{t("import.drop.prompt")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("import.drop.supports")}
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("import.progress.uploading")}</span>
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
            {t("import.requirements.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>{t("import.requirements.text1")}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>{t("import.requirements.item.textBased")}:</strong>{" "}
                {t("import.requirements.item.textBasedNote")}
              </li>
              <li>
                <strong>{t("import.requirements.item.bankStatement")}:</strong>{" "}
                {t("import.requirements.item.bankStatementNote")}
              </li>
              <li>
                <strong>{t("import.requirements.item.recent")}:</strong>{" "}
                {t("import.requirements.item.recentNote")}
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              {t("import.requirements.footer")}
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
              {t("import.history.title")}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStatements()}
            >
              {t("import.history.refresh")}
            </Button>
          </CardTitle>
          <CardDescription>{t("import.history.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!statements || statements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t("import.history.empty")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("import.table.filename")}</TableHead>
                  <TableHead>{t("import.table.uploaded")}</TableHead>
                  <TableHead>{t("import.table.status")}</TableHead>
                  <TableHead>{t("import.table.progress")}</TableHead>
                  <TableHead>{t("import.table.actions")}</TableHead>
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
                                {t("import.btn.extract")}
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
                                {t("import.btn.categorize")}
                              </Button>
                            )}

                          {(statement.extraction_status === "failed" ||
                            statement.categorization_status === "failed") &&
                            !isProcessing && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetryStep()}
                                disabled={false}
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                {t("import.btn.retry")}
                              </Button>
                            )}

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
                                {t("import.btn.processAll")}
                              </Button>
                            )}

                          {isProcessing && (
                            <Button
                              size="sm"
                              disabled
                              className="flex items-center gap-1"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {t("import.btn.processing")}
                            </Button>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Insights functionality temporarily disabled
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                {statement.is_processed
                                  ? t("import.btn.viewInsights")
                                  : t("import.btn.viewDetails")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle
                                  className="truncate"
                                  title={t("import.dialog.titlePrefix", {
                                    filename: statement.filename,
                                  })}
                                >
                                  {t("import.dialog.titlePrefix", {
                                    filename: statement.filename,
                                  })}
                                </DialogTitle>
                                <DialogDescription>
                                  {t("import.dialog.uploadedAgo", {
                                    ago: formatDistanceToNow(
                                      parseISO(statement.created_at)
                                    ),
                                  })}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* Statement Status */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("import.dialog.status")}
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
                                      {t("import.dialog.processingProgress")}
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
                                        &nbsp;-{" "}
                                        {getProgressInfo(statement).step}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Error Messages */}
                                {statement.error_message && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-destructive">
                                      {t("import.dialog.errorDetails")}
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
                                      {t("import.dialog.extractionStatus")}
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
                                      {t("import.dialog.categorizationStatus")}
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
                                      {t("import.dialog.retryCount")}
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {t("import.dialog.retryTimes", {
                                        count: statement.retry_count,
                                      })}
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
              {t("import.password.title")}
            </DialogTitle>
            <DialogDescription>
              {t("import.password.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-password">{t("import.password.label")}</Label>
              <Input
                id="pdf-password"
                type="password"
                placeholder={t("import.password.placeholder")}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>

            {passwordFile && (
              <div className="text-sm text-muted-foreground">
                {t("import.password.file")}: {passwordFile.name}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handlePasswordCancel}
                disabled={isUnlocking}
              >
                {t("import.password.cancel")}
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                disabled={!password.trim() || isUnlocking}
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("import.password.unlocking")}
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    {t("import.password.unlockUpload")}
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

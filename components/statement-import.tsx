"use client";

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
  useCards,
  useCheckPDFAccessibility,
  useStatements,
  useStatementStatus,
  useUploadStatementAsync,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  FileText,
  Loader2,
  Lock,
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
  const { refetch: refetchStatements } = useStatements();
  const uploadAsyncMutation = useUploadStatementAsync();
  const checkPDFMutation = useCheckPDFAccessibility();
  // Removed minimum-keywords validation gating per request

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
          console.log("🔍 PDF Check Response:", pdfStatus);
        } catch (error) {
          // If PDF check fails, log the error and assume it's not password protected
          console.error("🔍 PDF Check Error:", error);
          pdfStatus = { 
            accessible: true, 
            encrypted: false, 
            needs_password: false,
            filename: file.name,
            file_size: file.size
          } as any;
        }

        setUploadProgress(20);

        console.log("🔍 Password Dialog Check:", {
          needs_password: pdfStatus.needs_password,
          encrypted: pdfStatus.encrypted,
          accessible: pdfStatus.accessible,
          condition1: pdfStatus.needs_password,
          condition2: (pdfStatus.encrypted && !pdfStatus.accessible),
          shouldShowDialog: pdfStatus.needs_password || (pdfStatus.encrypted && !pdfStatus.accessible)
        });

        if (pdfStatus.needs_password || (pdfStatus.encrypted && !pdfStatus.accessible)) {
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
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5 cursor-pointer"
                : "border-muted-foreground/25 hover:border-primary/50 cursor-pointer"
            }`}
          >
            <input {...getInputProps()} />
            <FileText className={`h-12 w-12 mx-auto mb-4 text-muted-foreground`} />
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

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileText,
  Check,
  X,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import {
  useCards,
  useStatements,
  useUploadStatement,
  useProcessStatement,
} from "@/lib/hooks";
import { Statement } from "@/lib/types";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";

export function StatementImport() {
  const [selectedCard, setSelectedCard] = useState<string>("none");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(
    null
  );

  const { data: cards } = useCards();
  const { data: statements, refetch: refetchStatements } = useStatements();
  const uploadMutation = useUploadStatement();
  const processMutation = useProcessStatement();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Card selection is optional for upload
      // if (!selectedCard) {
      //   toast.error("Please select a card first");
      //   return;
      // }

      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        console.log("Uploading file:", file.name, selectedCard && selectedCard !== "none" ? "for card:" + selectedCard : "without card association");

        const result = await uploadMutation.mutateAsync({
          file,
          cardId: selectedCard && selectedCard !== "none" ? selectedCard : undefined,
        });

        console.log("Upload result:", result);
        setUploadProgress(100);
        clearInterval(progressInterval);

        // Refresh statements list
        await refetchStatements();

        toast.success("Statement uploaded successfully!");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(
          error.response?.data?.detail ||
            error.message ||
            "Failed to upload statement"
        );
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 2000);
      }
    },
    [selectedCard, uploadMutation, refetchStatements]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleProcessStatement = async (statement: Statement) => {
    try {
      const result = await processMutation.mutateAsync({
        statementId: statement.id,
        cardId: selectedCard && selectedCard !== "none" ? selectedCard : undefined,
        cardName: selectedCard && selectedCard !== "none" ? cards?.find(c => c.id === selectedCard)?.card_name : undefined,
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

  const getStatusBadge = (statement: Statement) => {
    if (statement.is_processed) {
      return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
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
            Upload your bank statement in CSV format to automatically import
            transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Selection */}
          <div className="space-y-2">
            <Label htmlFor="card-select">Associate with Card (Optional)</Label>
            <Select value={selectedCard} onValueChange={setSelectedCard}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a card to associate with this statement (recommended)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No card association</SelectItem>
                {cards?.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.card_name} ({card.card_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Associating with a card helps with better transaction categorization and tracking.
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
              <p className="text-lg">Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Drag & drop a CSV file here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV files up to 10MB
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
            CSV Format Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>Your CSV file should contain the following columns:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Date:</strong> Transaction date (MM/DD/YYYY or
                YYYY-MM-DD)
              </li>
              <li>
                <strong>Description/Merchant:</strong> Transaction description
              </li>
              <li>
                <strong>Amount:</strong> Transaction amount (positive or
                negative)
              </li>
              <li>
                <strong>Category:</strong> Transaction category (optional)
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              The system will automatically detect common CSV formats from major
              banks.
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
            View and manage your uploaded statements. You can process statements without card association, but associating with a card provides better insights.
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statements.map((statement) => (
                  <TableRow key={statement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">
                          {statement.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(statement.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(statement)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!statement.is_processed && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessStatement(statement)}
                            disabled={processMutation.isPending}
                          >
                            {processMutation.isPending ? "Processing..." : "Process"}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

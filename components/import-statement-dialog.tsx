"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { StatementImport } from "@/components/statement-import";

interface ImportStatementDialogProps {
  trigger?: React.ReactNode;
}

export function ImportStatementDialog({ trigger }: ImportStatementDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Import Statement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Bank Statement</DialogTitle>
          <DialogDescription>
            Upload your bank statement in PDF format to automatically import and
            categorize transactions
          </DialogDescription>
        </DialogHeader>
        <StatementImport />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <ShieldAlert className="h-12 w-12 text-amber-500" />
      <h1 className="text-2xl font-bold">403 — Forbidden</h1>
      <p className="text-muted-foreground max-w-md">
        You don’t have access to this page. If you believe this is a mistake,
        contact support.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}

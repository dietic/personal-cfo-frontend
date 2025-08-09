"use client";

import React, { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/lib/settings-context";
import { VerificationGate } from "@/components/verification-gate";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>
          {/* Enforce OTP redirect globally when email verification is pending */}
          <Suspense fallback={null}>
            <VerificationGate />
          </Suspense>
          <SettingsProvider>{children}</SettingsProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

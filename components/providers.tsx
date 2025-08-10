"use client";

import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { VerificationGate } from "@/components/verification-gate";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n";
import { SettingsProvider } from "@/lib/settings-context";
import React, { Suspense } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider defaultLocale="es">
      <ThemeProvider
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
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
    </I18nProvider>
  );
}

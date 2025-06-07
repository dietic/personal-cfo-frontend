import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinanceCFO - Your Personal Finance Dashboard",
  description:
    "Track, analyze, and course-correct your spending habits in real-time",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

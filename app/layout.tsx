import { DashboardLayout } from "@/components/dashboard-layout";
import { PageFade } from "@/components/page-fade";
import { Providers } from "@/components/providers";
import RouteTransition from "@/components/route-transition";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

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
          <RouteTransition />
          <DashboardLayout>
            <PageFade>{children}</PageFade>
          </DashboardLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

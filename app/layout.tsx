import { DashboardLayout } from "@/components/dashboard-layout";
import { PageFade } from "@/components/page-fade";
import { Providers } from "@/components/providers";
import RouteTransition from "@/components/route-transition";
import { Toaster } from "@/components/ui/sonner";
import { getServerLocale, tServer } from "@/lib/i18n-server";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: tServer("site.title"),
  description: tServer("site.description"),
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getServerLocale();
  const htmlLang = locale === "es" ? "es-PE" : "en";
  return (
    <html lang={htmlLang} suppressHydrationWarning>
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

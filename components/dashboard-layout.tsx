"use client";

import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import RouteLoader from "@/components/route-loader";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import {
  BarChart3,
  CalendarClock,
  CreditCard,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  PiggyBank,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { LanguageToggle } from "./language-toggle";

export function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { t } = useI18n();

  // Development bypass for testing
  const isDevelopment = process.env.NODE_ENV === "development";
  const bypassAuth = isDevelopment && pathname.startsWith("/transactions");

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/terms",
    "/privacy",
    "/landing",
    "/forbidden",
  ];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect to login if not authenticated and not on a public route (unless bypassing for development)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute && !bypassAuth) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isPublicRoute, bypassAuth, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // For public routes (login, signup), don't show the dashboard layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, redirect to login if not authenticated (unless bypassing for development)
  if (!isAuthenticated && !bypassAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg">{t("common.redirectingToLogin")}</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const baseMenuItems = [
    {
      title: t("layout.menu.dashboard"),
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    { title: t("layout.menu.cards"), icon: CreditCard, href: "/cards" },
    {
      title: t("layout.menu.transactions"),
      icon: Receipt,
      href: "/transactions",
    },
    { title: t("layout.menu.statements"), icon: FileText, href: "/statements" },
    {
      title: t("layout.menu.services"),
      icon: CalendarClock,
      href: "/services",
    },
    { title: t("layout.menu.analytics"), icon: BarChart3, href: "/analytics" },
    { title: t("layout.menu.budget"), icon: PiggyBank, href: "/budget" },
    { title: t("layout.menu.settings"), icon: Settings, href: "/settings" },
  ];

  // No hook here to avoid changing hooks order with early returns above
  const menuItems = user?.is_admin
    ? [
        ...baseMenuItems,
        { title: t("layout.menu.admin"), icon: ShieldCheck, href: "/admin" },
      ]
    : baseMenuItems;

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="flex h-14 items-center px-4 border-b">
            <Logo className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-bold">FinanceCFO</span>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
            <div className="mb-4 px-4">
              <div className="flex items-center gap-3 mb-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt={t("layout.user")}
                  />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {user?.email?.split("@")[0] || t("layout.user")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("layout.account.personal")}
                  </span>
                </div>
              </div>
            </div>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-medium"
                        : ""
                    }
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={pathname === item.href ? "text-primary" : ""}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="mt-6 px-4">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">
                    {t("layout.pro.title")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("layout.pro.description")}
                </p>
                <Button size="sm" className="w-full">
                  {t("layout.pro.upgrade")}
                </Button>
              </div>
            </div>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center justify-between">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("userNav.profile")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("userNav.settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("userNav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggleButton />
              <UserNav />
            </div>
          </header>
          <main className="relative flex-1 overflow-auto p-6">
            <RouteLoader variant="content" />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

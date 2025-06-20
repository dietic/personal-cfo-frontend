"use client";

import type React from "react";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { UserNav } from "@/components/user-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  BarChart3,
  PiggyBank,
  Settings,
  LogOut,
  User,
  Sparkles,
  CalendarClock,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  // Development bypass for testing
  const isDevelopment = process.env.NODE_ENV === "development";
  const bypassAuth = isDevelopment && pathname.startsWith("/transactions");

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/terms",
    "/privacy",
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
          <p className="text-muted-foreground">Loading...</p>
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
          <p className="text-lg">Redirecting to login...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "Cards", icon: CreditCard, href: "/cards" },
    { title: "Transactions", icon: Receipt, href: "/transactions" },
    { title: "Statements", icon: FileText, href: "/statements" },
    { title: "Services", icon: CalendarClock, href: "/services" },
    { title: "Analytics", icon: BarChart3, href: "/analytics" },
    { title: "Budget", icon: PiggyBank, href: "/budget" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ];

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
                    alt="User"
                  />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {user?.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Personal Account
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
                  <span className="font-medium text-sm">Pro Features</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upgrade to unlock advanced analytics and budgeting tools.
                </p>
                <Button size="sm" className="w-full">
                  Upgrade
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
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <ThemeToggleButton />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

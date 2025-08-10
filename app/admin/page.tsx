"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/format";
import {
  useAdminSignupStats,
  useAdminUsers,
  useToggleUserActive,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { AdminUsersParams, SignupStatsPoint, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  // Gate non-admins
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.is_admin) {
        router.push("/forbidden");
      }
    }
  }, [user, isLoading, router]);

  // Table state
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;
  const offset = (page - 1) * limit;

  const params: AdminUsersParams = useMemo(
    () => ({
      q: q || undefined,
      limit,
      offset,
      sort: "created_at",
      order: "desc",
    }),
    [q, limit, offset]
  );

  const { data: users = [], isFetching } = useAdminUsers(params);
  const toggleUser = useToggleUserActive();

  // Simple guess: if we got less than limit, we're at last page
  const isLastPage = users.length < limit;

  const handleToggle = (u: User) => {
    if (u.id === user?.id || u.id === "current-user") {
      toast.error(t("admin.cannotChangeOwn"));
      return;
    }
    toggleUser.mutate({ userId: u.id, isActive: !u.is_active });
  };

  // Signup stats chart
  const { data: stats } = useAdminSignupStats();
  const chartData: SignupStatsPoint[] = stats?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("admin.users.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder={t("admin.search.placeholder")}
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.table.email")}</TableHead>
                    <TableHead>{t("admin.table.name")}</TableHead>
                    <TableHead>{t("admin.table.status")}</TableHead>
                    <TableHead>{t("admin.table.admin")}</TableHead>
                    <TableHead>{t("admin.table.created")}</TableHead>
                    <TableHead className="text-right">
                      {t("admin.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {u.name || `${u.first_name ?? ""} ${u.last_name ?? ""}`}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.is_active
                            ? t("admin.status.active")
                            : t("admin.status.inactive")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {u.is_admin ? t("admin.yes") : t("admin.no")}
                      </TableCell>
                      <TableCell>{formatDate(u.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={u.is_active ? "destructive" : "default"}
                          onClick={() => handleToggle(u)}
                          disabled={toggleUser.isPending}
                        >
                          {u.is_active
                            ? t("admin.actions.deactivate")
                            : t("admin.actions.activate")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        {isFetching ? t("admin.loading") : t("admin.noUsers")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t("admin.pagination.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("admin.pagination.page", { page: String(page) })}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLastPage}
              >
                {t("admin.pagination.next")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.chart.signupsPerDay")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: {
                  label: t("admin.chart.signups"),
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-64"
            >
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  width={24}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary)/.2)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

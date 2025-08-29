"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  useAdminUsers,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { AdminUsersParams, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminUserEditDialog } from "@/components/admin-user-edit-dialog";
import { Edit3, Power, UserCheck, UserX, Search, ChevronLeft, ChevronRight, Shield, Crown, Zap } from "lucide-react";

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

  // Edit dialog state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  // Simple guess: if we got less than limit, we're at last page
  const isLastPage = users.length < limit;

  const handleEdit = (u: User) => {
    setEditingUser(u);
    setIsEditDialogOpen(true);
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {t("admin.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.users.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.search.placeholder")}
                  value={q}
                  onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.table.email")}</TableHead>
                    <TableHead>{t("admin.table.name")}</TableHead>
                    <TableHead>{t("admin.table.status")}</TableHead>
                    <TableHead>{t("admin.table.admin")}</TableHead>
                    <TableHead>Plan</TableHead>
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
                        <Badge 
                          variant={u.is_active ? "default" : "destructive"}
                          className="whitespace-nowrap"
                        >
                          {u.is_active ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              {t("admin.status.active")}
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              {t("admin.status.inactive")}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.is_admin ? t("admin.yes") : t("admin.no")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="whitespace-nowrap capitalize"
                        >
                          {u.plan_tier === "free" ? (
                            <>
                              <Zap className="h-3 w-3 mr-1 text-muted-foreground" />
                              Free
                            </>
                          ) : u.plan_tier === "plus" ? (
                            <>
                              <Zap className="h-3 w-3 mr-1 text-blue-500" />
                              Plus
                            </>
                          ) : (
                            <>
                              <Crown className="h-3 w-3 mr-1 text-purple-500" />
                              Pro
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(u.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(u)}
                            className="h-8 w-8 p-0"
                            title={t("admin.actions.edit")}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("admin.pagination.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("admin.pagination.page", { page: String(page) })}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLastPage}
                className="gap-1"
              >
                {t("admin.pagination.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      <AdminUserEditDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}

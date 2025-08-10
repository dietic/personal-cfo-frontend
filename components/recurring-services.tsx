"use client";

import { CategorySelect } from "@/components/category-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatMoney } from "@/lib/format";
import {
  useCreateRecurringService,
  useDeleteRecurringService,
  useRecurringServices,
  useUpdateRecurringService,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { RecurringService } from "@/lib/types";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface RecurringServiceFormProps {
  service?: RecurringService;
  onClose: () => void;
}

function RecurringServiceForm({ service, onClose }: RecurringServiceFormProps) {
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const [formData, setFormData] = useState({
    name: service?.name || "",
    amount: service?.amount?.toString() || "",
    due_date: service?.due_date || "",
    category: service?.category || "",
    reminder_days: service?.reminder_days || 3,
  });

  const createMutation = useCreateRecurringService();
  const updateMutation = useUpdateRecurringService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      category: formData.category || null,
      reminder_days: formData.reminder_days || null,
    };

    try {
      if (service) {
        await updateMutation.mutateAsync({ serviceId: service.id, data });
        toast({ title: t("recurring.updatedSuccessfully") });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: t("recurring.createdSuccessfully") });
      }
      onClose();
    } catch (error) {
      toast({
        description: service
          ? t("recurring.updateFailed")
          : t("recurring.createFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("recurring.form.name")}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">{t("recurring.form.amount")}</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="due_date">{t("recurring.form.dueDate")}</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) =>
            setFormData({ ...formData, due_date: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="category">{t("recurring.form.category")}</Label>
        <CategorySelect
          value={formData.category || ""}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
          placeholder={t("recurring.form.categoryPlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="reminder_days">
          {t("recurring.form.reminderDays")}
        </Label>
        <Input
          id="reminder_days"
          type="number"
          value={formData.reminder_days || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              reminder_days: parseInt(e.target.value) || 3,
            })
          }
          placeholder={t("recurring.form.reminderDaysPlaceholder")}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {service
            ? t("recurring.form.submitUpdate")
            : t("recurring.form.submitCreate")}
        </Button>
      </div>
    </form>
  );
}

export function RecurringServices() {
  const { data: services, isLoading, error } = useRecurringServices();
  const deleteMutation = useDeleteRecurringService();
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const [editingService, setEditingService] = useState<RecurringService | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm(t("recurring.delete.confirmDescription"))) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: t("recurring.deletedSuccessfully") });
      } catch (error) {
        toast({
          description: t("recurring.deleteFailed"),
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (service: RecurringService) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (service: RecurringService) => {
    const dueDate = new Date(service.due_date);
    const today = new Date();
    const daysUntil = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil < 0) {
      return (
        <Badge variant="destructive">{t("recurring.status.overdue")}</Badge>
      );
    } else if (daysUntil <= 3) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          {t("recurring.status.dueSoon")}
        </Badge>
      );
    }

    return <Badge variant="default">{t("recurring.status.upcoming")}</Badge>;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            {t("recurring.loadFailed")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("recurring.page.title")}
            </CardTitle>
            <CardDescription>{t("recurring.page.description")}</CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button aria-label={t("recurring.addService")}>
                <Plus className="h-4 w-4 mr-2" />
                {t("recurring.addService")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("recurring.addDialog.title")}</DialogTitle>
              </DialogHeader>
              <RecurringServiceForm
                onClose={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" aria-busy>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{service.name}</h3>
                      {getStatusBadge(service)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div
                        className="flex items-center gap-1"
                        aria-label={t("recurring.form.amount")}
                      >
                        <DollarSign className="h-3 w-3" />
                        {formatMoney(Number(service.amount), "USD", locale)}
                      </div>
                      {service.category && <span>• {service.category}</span>}
                      <span>
                        • {t("recurring.form.dueDate")}{" "}
                        {formatDate(service.due_date, locale, {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      aria-label={t("recurring.editDialog.title")}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      disabled={deleteMutation.isPending}
                      aria-label={t("recurring.delete.confirmTitle")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar
              className="h-12 w-12 mx-auto mb-4 opacity-50"
              aria-hidden="true"
            />
            <p>{t("recurring.empty.title")}</p>
            <p className="text-sm">{t("recurring.empty.subtitle")}</p>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("recurring.editDialog.title")}</DialogTitle>
          </DialogHeader>
          <RecurringServiceForm
            service={editingService || undefined}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  Plus,
  Wifi,
  Zap,
  Droplets,
  Flame,
  Trash2,
  Edit2,
} from "lucide-react";
import { format, addDays, isBefore, parseISO } from "date-fns";
import {
  useRecurringServices,
  useCreateRecurringService,
  useUpdateRecurringService,
  useDeleteRecurringService,
} from "@/lib/hooks";
import { RecurringServiceCreate, RecurringServiceUpdate } from "@/lib/types";

// Service types with their respective icons
const serviceTypes = [
  { id: "internet", name: "Internet", icon: Wifi },
  { id: "electricity", name: "Electricity", icon: Zap },
  { id: "water", name: "Water", icon: Droplets },
  { id: "gas", name: "Gas", icon: Flame },
  { id: "other", name: "Other", icon: CalendarIcon },
];

// Service status types
type ServiceStatus = "upcoming" | "due-soon" | "overdue" | "paid";

export function RecurringServices() {
  const { data: services, isLoading, error } = useRecurringServices();
  const createServiceMutation = useCreateRecurringService();
  const updateServiceMutation = useUpdateRecurringService();
  const deleteServiceMutation = useDeleteRecurringService();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RecurringServiceCreate>>({
    name: "",
    amount: "",
    due_date: "",
    category: "",
    reminder_days: 3,
  });

  // Process services to determine status
  const processedServices =
    services?.map((service) => {
      const today = new Date();
      const dueDate = parseISO(service.due_date);
      let status: ServiceStatus = "upcoming";

      if (isBefore(dueDate, today)) {
        status = "overdue";
      } else if (isBefore(dueDate, addDays(today, 7))) {
        status = "due-soon";
      }

      return {
        ...service,
        status,
        amount_num: parseFloat(service.amount),
      };
    }) || [];

  // Calculate total monthly expenses
  const totalMonthly = processedServices.reduce(
    (sum, service) => sum + service.amount_num,
    0
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.due_date) {
      return;
    }

    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          serviceId: editingService,
          data: {
            name: formData.name,
            amount: formData.amount,
            due_date: formData.due_date,
            category: formData.category || null,
            reminder_days: formData.reminder_days || null,
          },
        });
      } else {
        await createServiceMutation.mutateAsync({
          name: formData.name!,
          amount: formData.amount!,
          due_date: formData.due_date!,
          category: formData.category || null,
          reminder_days: formData.reminder_days || null,
        });
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        amount: "",
        due_date: "",
        category: "",
        reminder_days: 3,
      });
      setEditingService(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save service:", error);
    }
  };

  // Handle edit service
  const handleEdit = (service: any) => {
    setEditingService(service.id);
    setFormData({
      name: service.name,
      amount: service.amount,
      due_date: service.due_date,
      category: service.category || "",
      reminder_days: service.reminder_days || 3,
    });
    setIsDialogOpen(true);
  };

  // Handle delete service
  const handleDelete = async (id: string) => {
    try {
      await deleteServiceMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  // Filter services by status
  const upcomingServices = processedServices.filter(
    (service) => service.status === "upcoming" || service.status === "due-soon"
  );
  const overdueServices = processedServices.filter(
    (service) => service.status === "overdue"
  );

  const getServiceIcon = (category?: string) => {
    const serviceType = serviceTypes.find(
      (type) => type.id === category?.toLowerCase()
    );
    return serviceType?.icon || CalendarIcon;
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "due-soon":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            Due Soon
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="default">Paid</Badge>;
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Recurring Services
          </CardTitle>
          <CardDescription>Track your monthly service payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Failed to load recurring services
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Recurring Services
              </CardTitle>
              <CardDescription>
                Track your monthly service payments
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Recurring Services
            </CardTitle>
            <CardDescription>
              Track your monthly service payments
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Edit Service" : "Add New Service"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingService
                      ? "Update your recurring service details."
                      : "Add a new recurring service to track payments."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Comcast Internet"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due_date">Next Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reminder_days">Reminder Days</Label>
                    <Input
                      id="reminder_days"
                      type="number"
                      value={formData.reminder_days || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reminder_days: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingService(null);
                      setFormData({
                        name: "",
                        amount: "",
                        due_date: "",
                        category: "",
                        reminder_days: 3,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createServiceMutation.isPending ||
                      updateServiceMutation.isPending
                    }
                  >
                    {editingService ? "Update" : "Add"} Service
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {totalMonthly > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">
              Total Monthly Expenses:{" "}
              <span className="text-lg font-bold">
                ${totalMonthly.toFixed(2)}
              </span>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {processedServices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recurring services found</p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingServices.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueServices.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingServices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming services
                </p>
              ) : (
                upcomingServices.map((service) => {
                  const ServiceIcon = getServiceIcon(
                    service.category || undefined
                  );
                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ServiceIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Due{" "}
                            {format(parseISO(service.due_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(service.status)}
                        <span className="font-semibold">
                          ${service.amount_num.toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(service.id)}
                            disabled={deleteServiceMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              {overdueServices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No overdue services
                </p>
              ) : (
                overdueServices.map((service) => {
                  const ServiceIcon = getServiceIcon(
                    service.category || undefined
                  );
                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border rounded-lg border-destructive/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-full">
                          <ServiceIcon className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Due{" "}
                            {format(parseISO(service.due_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(service.status)}
                        <span className="font-semibold">
                          ${service.amount_num.toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(service.id)}
                            disabled={deleteServiceMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

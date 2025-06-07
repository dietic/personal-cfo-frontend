"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  useRecurringServices,
  useCreateRecurringService,
  useUpdateRecurringService,
  useDeleteRecurringService,
} from "@/lib/hooks";
import {
  RecurringService,
  RecurringServiceCreate,
  RecurringServiceUpdate,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface RecurringServiceFormProps {
  service?: RecurringService;
  onClose: () => void;
}

function RecurringServiceForm({ service, onClose }: RecurringServiceFormProps) {
  const { toast } = useToast();
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
        toast({ title: "Service updated successfully" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Service created successfully" });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: service
          ? "Failed to update service"
          : "Failed to create service",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
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
        <Label htmlFor="due_date">Due Date</Label>
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
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category || ""}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="reminder_days">Reminder Days</Label>
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
          placeholder="3"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {service ? "Update" : "Create"} Service
        </Button>
      </div>
    </form>
  );
}

export function RecurringServices() {
  const { data: services, isLoading, error } = useRecurringServices();
  const deleteMutation = useDeleteRecurringService();
  const { toast } = useToast();
  const [editingService, setEditingService] = useState<RecurringService | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: "Service deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete service",
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
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntil <= 3) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          Due Soon
        </Badge>
      );
    }

    return <Badge variant="default">Upcoming</Badge>;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            Failed to load recurring services
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
              Recurring Services
            </CardTitle>
            <CardDescription>
              Manage your subscription and recurring payment services
            </CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Recurring Service</DialogTitle>
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
          <div className="space-y-4">
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
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />$
                        {parseFloat(service.amount).toFixed(2)}
                      </div>
                      {service.category && <span>• {service.category}</span>}
                      <span>
                        • Due:{" "}
                        {format(new Date(service.due_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      disabled={deleteMutation.isPending}
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
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recurring services found</p>
            <p className="text-sm">
              Add your first recurring service to get started
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recurring Service</DialogTitle>
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

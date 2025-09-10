"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { Category, CategoryCreate, CategoryUpdate } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Plus,
  Settings,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";

const DEFAULT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // slate
  "#dc2626", // red-600
];

interface SimpleCategoriesManagementProps {
  onManageKeywords?: () => void;
}

export function SimpleCategoriesManagement({
  onManageKeywords,
}: SimpleCategoriesManagementProps) {
  const { t } = useI18n();
  const { data: categoriesData, isLoading, error } = useCategories();
  
  // Extract categories and permissions from the same response
  const categories = categoriesData?.categories || [];
  const permissions = categoriesData?.permissions;
  
  // Default to restricted permissions while loading or if no permissions data
  const canCreate = permissions?.can_create_categories === true;
  const canEdit = permissions?.can_edit_categories === true;
  const canDelete = permissions?.can_delete_categories === true;
  
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryCreate>({
    name: "",
    color: DEFAULT_COLORS[0],
    emoji: "",
    keywords: [],
    is_active: true,
  });
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(DEFAULT_COLORS[0]);

  const isDefaultColor = (color: string) => DEFAULT_COLORS.includes(color);

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast.error(t("category.errors.nameRequired"));
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        color: formData.color,
        emoji: formData.emoji || undefined, // Don't send empty string
        is_active: formData.is_active,
        // Remove keywords from category creation
      });
      setShowCreateDialog(false);
      resetForm();
      toast.success(t("category.createdSuccessfully"));
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error(t("category.errors.nameRequired"));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        categoryId: editingCategory.id,
        data: {
          name: formData.name,
          color: formData.color,
          emoji: formData.emoji || undefined, // Don't send empty string
          is_active: formData.is_active,
          // Remove keywords from category update
        } as CategoryUpdate,
      });
      setEditingCategory(null);
      resetForm();
      toast.success(t("category.updatedSuccessfully"));
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteMutation.mutateAsync(categoryId);
      toast.success(t("category.deletedSuccessfully"));
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: DEFAULT_COLORS[0],
      emoji: "",
      keywords: [],
      is_active: true,
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || DEFAULT_COLORS[0],
      emoji: category.emoji || "",
      keywords: [],
      is_active: category.is_active,
    });
  };

  const categoriesCount = categories?.length || 0;
  const isRequirementMet = categoriesCount >= 5;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("simpleCategories.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border border-current border-t-transparent rounded-full" />
            <span className="ml-2">{t("simpleCategories.loading")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("simpleCategories.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{t("simpleCategories.failed")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("simpleCategories.title")}
          </div>
          {onManageKeywords && (
            <Button
              variant="outline"
              onClick={onManageKeywords}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {t("simpleCategories.manageKeywords")}
            </Button>
          )}
        </CardTitle>
        <CardDescription className="space-y-2">
          <div className="flex items-center gap-2">
            {isRequirementMet ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            )}
            <span>
              {t("simpleCategories.countStatus", { count: categoriesCount })}
              {!isRequirementMet && ` ${t("simpleCategories.minRequired")}`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("simpleCategories.help")}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {canCreate ? (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("simpleCategories.addCategory.cta")}
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t("simpleCategories.create.title")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("simpleCategories.create.description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {t("simpleCategories.form.name")} *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={t("simpleCategories.form.namePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emoji">
                      {t("categories.form.emoji")}
                    </Label>
                    <Input
                      id="emoji"
                      value={formData.emoji || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, emoji: e.target.value })
                      }
                      placeholder={t("categories.form.emojiPlaceholder")}
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label>{t("simpleCategories.form.color")}</Label>
                    <div className="flex gap-2 flex-wrap items-center">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color
                              ? "border-gray-900 ring-2 ring-offset-2 ring-gray-900"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                      
                      {/* Custom Color Picker - Only show if current color is not a default */}
                      {!isDefaultColor(formData.color) && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 ring-2 ring-offset-2 ring-gray-900"
                              title="Custom color"
                              style={{ backgroundColor: formData.color }}
                              onClick={() => setTempColor(formData.color)}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="start">
                            <div className="space-y-4">
                              <HexColorPicker
                                color={tempColor}
                                onChange={setTempColor}
                                className="!w-full !h-32"
                              />
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded border"
                                  style={{ backgroundColor: tempColor }}
                                />
                                <Input
                                  value={tempColor}
                                  onChange={(e) => setTempColor(e.target.value)}
                                  className="h-8 text-xs"
                                  placeholder="#000000"
                                />
                              </div>
                              <Button
                                onClick={() => {
                                  setFormData({ ...formData, color: tempColor });
                                  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                                }}
                                className="w-full"
                              >
                                {t("common.apply")}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      
                      {/* Add Custom Color Button - Only show if current color is a default */}
                      {isDefaultColor(formData.color) && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400"
                              title="Add custom color"
                              onClick={() => setTempColor(formData.color)}
                            >
                              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-blue-500" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="start">
                            <div className="space-y-4">
                              <HexColorPicker
                                color={tempColor}
                                onChange={setTempColor}
                                className="!w-full !h-32"
                              />
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded border"
                                  style={{ backgroundColor: tempColor }}
                                />
                                <Input
                                  value={tempColor}
                                  onChange={(e) => setTempColor(e.target.value)}
                                  className="h-8 text-xs"
                                  placeholder="#000000"
                                />
                              </div>
                              <Button
                                onClick={() => {
                                  setFormData({ ...formData, color: tempColor });
                                  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                                }}
                                className="w-full"
                              >
                                {t("common.apply")}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleCreateCategory}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending
                      ? t("common.saving")
                      : t("simpleCategories.create.submit")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {permissions?.message || "You cannot create categories with your current plan."}
                </p>
              </div>
            )}
          </div>

          {categories && categories.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("simpleCategories.table.category")}
                    </TableHead>
                    <TableHead>{t("categories.table.emoji")}</TableHead>
                    <TableHead>{t("simpleCategories.table.status")}</TableHead>
                    <TableHead>{t("simpleCategories.table.created")}</TableHead>
                    <TableHead className="w-[100px]">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: category.color || "#64748b",
                            }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.emoji && (
                          <span className="text-lg">{category.emoji}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.is_active ? "default" : "secondary"}
                        >
                          {category.is_active
                            ? t("simpleCategories.status.active")
                            : t("simpleCategories.status.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(category.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {canEdit && (category.can_modify !== false) ? (
                            <Dialog open={editingCategory?.id === category.id} onOpenChange={(open) => !open && setEditingCategory(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(category)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {t("simpleCategories.edit.title")}
                                </DialogTitle>
                                <DialogDescription>
                                  {t("simpleCategories.edit.description")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">
                                    {t("simpleCategories.form.name")} *
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        name: e.target.value,
                                      })
                                    }
                                    placeholder={t(
                                      "simpleCategories.form.namePlaceholder"
                                    )}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-emoji">
                                    {t("categories.form.emoji")}
                                  </Label>
                                  <Input
                                    id="edit-emoji"
                                    value={formData.emoji || ""}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        emoji: e.target.value,
                                      })
                                    }
                                    placeholder={t("categories.form.emojiPlaceholder")}
                                    maxLength={10}
                                  />
                                </div>
                                <div>
                                  <Label>
                                    {t("simpleCategories.form.color")}
                                  </Label>
                                  <div className="flex gap-2 flex-wrap items-center">
                                    {DEFAULT_COLORS.map((color) => (
                                      <button
                                        key={color}
                                        type="button"
                                        className={`w-8 h-8 rounded-full border-2 ${
                                          formData.color === color
                                            ? "border-gray-900 ring-2 ring-offset-2 ring-gray-900"
                                            : "border-gray-300"
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() =>
                                          setFormData({ ...formData, color })
                                        }
                                      />
                                    ))}
                                    
                                    {/* Custom Color Picker - Only show if current color is not a default */}
                                    {!isDefaultColor(formData.color) && (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            type="button"
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 ring-2 ring-offset-2 ring-gray-900"
                                            title="Custom color"
                                            style={{ backgroundColor: formData.color }}
                                            onClick={() => setTempColor(formData.color)}
                                          />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-4" align="start">
                                          <div className="space-y-4">
                                            <HexColorPicker
                                              color={tempColor}
                                              onChange={setTempColor}
                                              className="!w-full !h-32"
                                            />
                                            <div className="flex items-center gap-2">
                                              <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: tempColor }}
                                              />
                                              <Input
                                                value={tempColor}
                                                onChange={(e) => setTempColor(e.target.value)}
                                                className="h-8 text-xs"
                                                placeholder="#000000"
                                              />
                                            </div>
                                            <Button
                                              onClick={() => {
                                                setFormData({ ...formData, color: tempColor });
                                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                                              }}
                                              className="w-full"
                                            >
                                              {t("common.apply")}
                                            </Button>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                    
                                    {/* Add Custom Color Button - Only show if current color is a default */}
                                    {isDefaultColor(formData.color) && (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            type="button"
                                            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400"
                                            title="Add custom color"
                                            onClick={() => setTempColor(formData.color)}
                                          >
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-blue-500" />
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-4" align="start">
                                          <div className="space-y-4">
                                            <HexColorPicker
                                              color={tempColor}
                                              onChange={setTempColor}
                                              className="!w-full !h-32"
                                            />
                                            <div className="flex items-center gap-2">
                                              <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: tempColor }}
                                              />
                                              <Input
                                                value={tempColor}
                                                onChange={(e) => setTempColor(e.target.value)}
                                                className="h-8 text-xs"
                                                placeholder="#000000"
                                              />
                                            </div>
                                            <Button
                                              onClick={() => {
                                                setFormData({ ...formData, color: tempColor });
                                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                                              }}
                                              className="w-full"
                                            >
                                              {t("common.apply")}
                                            </Button>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingCategory(null)}
                                >
                                  {t("common.cancel")}
                                </Button>
                                <Button
                                  onClick={handleUpdateCategory}
                                  disabled={updateMutation.isPending}
                                >
                                  {updateMutation.isPending
                                    ? t("common.updating")
                                    : t("simpleCategories.edit.submit")}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          ) : null}

                          {canDelete && (category.can_modify !== false) ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("simpleCategories.delete.title")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("simpleCategories.delete.description", {
                                    name: category.name,
                                  })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {t("simpleCategories.delete.confirm")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("simpleCategories.empty.title")}</p>
              <p className="text-sm">{t("simpleCategories.empty.subtitle")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

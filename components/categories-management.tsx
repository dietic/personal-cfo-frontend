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
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

export function CategoriesManagement() {
  const { t } = useI18n();
  const { data: categories, isLoading, error } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryCreate>({
    name: "",
    color: DEFAULT_COLORS[0],
    keywords: [],
    is_active: true,
  });
  const [keywordInput, setKeywordInput] = useState("");

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast.error(t("category.errors.nameRequired"));
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      setShowCreateDialog(false);
      resetForm();
      // Success toast handled by hook
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
        data: formData as CategoryUpdate,
      });
      setEditingCategory(null);
      resetForm();
      // Success toast handled by hook
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteMutation.mutateAsync(categoryId);
      // Success toast handled by hook
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: DEFAULT_COLORS[0],
      keywords: [],
      is_active: true,
    });
    setKeywordInput("");
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords?.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords?.filter((k: string) => k !== keyword) || [],
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || DEFAULT_COLORS[0],
      keywords: category.keywords || [],
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
            {t("categories.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border border-current border-t-transparent rounded-full" />
            <span className="ml-2">{t("categories.loading")}</span>
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
            {t("categories.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold">{t("categories.error.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("categories.error.line1")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("categories.error.line2")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                {t("categories.error.refresh")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast.info(t("categories.error.reportInfo"));
                }}
              >
                {t("categories.error.report")}
              </Button>
            </div>
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
            {t("categories.title")}
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                {t("categories.create.cta")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("categories.create.title")}</DialogTitle>
                <DialogDescription>
                  {t("categories.create.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("categories.form.name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("categories.form.placeholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("categories.form.color")}</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color
                            ? "border-gray-900"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("categories.form.keywords")}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder={t("categories.form.keywordPlaceholder")}
                      onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                    />
                    <Button
                      type="button"
                      onClick={addKeyword}
                      variant="outline"
                    >
                      {t("categories.form.add")}
                    </Button>
                  </div>
                  {formData.keywords && formData.keywords.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {formData.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
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
                    ? t("categories.creating")
                    : t("categories.create.submit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>{t("categories.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Banner */}
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border ${
            isRequirementMet
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          {isRequirementMet ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <div className="flex-1">
            <span className="font-medium">
              {isRequirementMet
                ? t("categories.status.ready")
                : t("categories.status.moreNeeded")}
            </span>
            <span className="ml-2">
              {t("categories.status.count", { count: String(categoriesCount) })}
            </span>
          </div>
        </div>

        {/* Categories Table */}
        {categories && categories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("categories.table.name")}</TableHead>
                <TableHead>{t("categories.table.color")}</TableHead>
                <TableHead>{t("categories.table.keywords")}</TableHead>
                <TableHead>{t("categories.table.status")}</TableHead>
                <TableHead>{t("categories.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: category.color || "#64748b" }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {category.color || "#64748b"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.keywords && category.keywords.length > 0 ? (
                      <div className="flex gap-1 flex-wrap max-w-xs">
                        {category.keywords.slice(0, 3).map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="outline"
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                        {category.keywords.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.keywords.length - 3}{" "}
                            {t("categories.more")}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t("categories.noKeywords")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={category.is_active ? "default" : "secondary"}
                    >
                      {category.is_active
                        ? t("categories.badge.active")
                        : t("categories.badge.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog
                        open={editingCategory?.id === category.id}
                        onOpenChange={(open) =>
                          !open && setEditingCategory(null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {t("categories.edit.title")}
                            </DialogTitle>
                            <DialogDescription>
                              {t("categories.edit.description")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">
                                {t("categories.form.name")}
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
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t("categories.form.color")}</Label>
                              <div className="flex gap-2 flex-wrap">
                                {DEFAULT_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${
                                      formData.color === color
                                        ? "border-gray-900"
                                        : "border-gray-300"
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() =>
                                      setFormData({ ...formData, color })
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("categories.form.keywords")}</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={keywordInput}
                                  onChange={(e) =>
                                    setKeywordInput(e.target.value)
                                  }
                                  placeholder={t(
                                    "categories.form.keywordPlaceholder"
                                  )}
                                  onKeyPress={(e) =>
                                    e.key === "Enter" && addKeyword()
                                  }
                                />
                                <Button
                                  type="button"
                                  onClick={addKeyword}
                                  variant="outline"
                                >
                                  {t("categories.form.add")}
                                </Button>
                              </div>
                              {formData.keywords &&
                                formData.keywords.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {formData.keywords.map((keyword) => (
                                      <Badge
                                        key={keyword}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {keyword}
                                        <button
                                          type="button"
                                          onClick={() => removeKeyword(keyword)}
                                          className="ml-1 hover:text-red-500"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
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
                                ? t("categories.updating")
                                : t("categories.edit.submit")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("categories.delete.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("categories.delete.description", {
                                name: category.name,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending
                                ? t("categories.deleting")
                                : t("categories.delete.confirm")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {t("categories.empty.title")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("categories.empty.description")}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("categories.empty.cta")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

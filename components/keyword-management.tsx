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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/format";
import {
  useCategories,
  useCreateKeyword,
  useCreateKeywordsBulk,
  useDeleteKeyword,
  useKeywordsByCategory,
  useSeedDefaultKeywords,
  useUpdateKeyword,
} from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { CategoryKeywordCreate, CategoryKeywordResponse } from "@/lib/types";
import {
  Edit3,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function KeywordManagement() {
  const { t } = useI18n();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createKeywordMutation = useCreateKeyword();
  const createKeywordsBulkMutation = useCreateKeywordsBulk();
  const updateKeywordMutation = useUpdateKeyword();
  const deleteKeywordMutation = useDeleteKeyword();
  const seedDefaultKeywordsMutation = useSeedDefaultKeywords();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false);
  const [editingKeyword, setEditingKeyword] =
    useState<CategoryKeywordResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Single keyword form state
  const [keywordForm, setKeywordForm] = useState<CategoryKeywordCreate>({
    category_id: "",
    keyword: "",
    description: "",
  });

  // Bulk keywords form state
  const [bulkKeywordsText, setBulkKeywordsText] = useState("");

  const { data: keywords, isLoading: keywordsLoading } =
    useKeywordsByCategory(selectedCategoryId);

  const selectedCategory = categories?.find(
    (cat) => cat.id === selectedCategoryId
  );

  const filteredKeywords =
    keywords?.filter(
      (keyword) =>
        keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        keyword.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleCreateKeyword = async () => {
    if (!keywordForm.keyword.trim()) {
      toast.error(t("keywords.errors.required"));
      return;
    }

    try {
      await createKeywordMutation.mutateAsync({
        ...keywordForm,
        category_id: selectedCategoryId,
      });
      setShowAddDialog(false);
      resetKeywordForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreateKeywordsBulk = async () => {
    const keywords = bulkKeywordsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (keywords.length === 0) {
      toast.error(t("keywords.errors.atLeastOne"));
      return;
    }

    try {
      await createKeywordsBulkMutation.mutateAsync({
        category_id: selectedCategoryId,
        keywords,
      });
      setShowBulkAddDialog(false);
      setBulkKeywordsText("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateKeyword = async () => {
    if (!editingKeyword || !keywordForm.keyword.trim()) {
      toast.error(t("keywords.errors.required"));
      return;
    }

    try {
      await updateKeywordMutation.mutateAsync({
        keywordId: editingKeyword.id,
        data: {
          keyword: keywordForm.keyword,
          description: keywordForm.description || null,
        },
      });
      setEditingKeyword(null);
      resetKeywordForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      await deleteKeywordMutation.mutateAsync(keywordId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSeedDefaultKeywords = async () => {
    try {
      await seedDefaultKeywordsMutation.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetKeywordForm = () => {
    setKeywordForm({
      category_id: "",
      keyword: "",
      description: "",
    });
  };

  const openEditDialog = (keyword: CategoryKeywordResponse) => {
    setEditingKeyword(keyword);
    setKeywordForm({
      category_id: keyword.category_id,
      keyword: keyword.keyword,
      description: keyword.description || "",
    });
  };

  if (categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("keywords.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border border-current border-t-transparent rounded-full" />
            <span className="ml-2">{t("keywords.loadingCategories")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("keywords.title")}
          </CardTitle>
          <CardDescription>{t("keywords.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <Label htmlFor="category-select">
                {t("keywords.selectCategory")}
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder={t("keywords.choosePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: category.color || "#64748b",
                          }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSeedDefaultKeywords}
                      disabled={seedDefaultKeywordsMutation.isPending}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {seedDefaultKeywordsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {t("keywords.seedDefaults")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("keywords.seedTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {!selectedCategoryId && (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("keywords.empty.selectPrompt")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: selectedCategory?.color || "#64748b",
                    }}
                  />
                  {t("keywords.categoryTitle", {
                    name: selectedCategory?.name || "",
                  })}
                </CardTitle>
                <CardDescription>
                  {t("keywords.metrics.count", {
                    count: String(keywords?.length || 0),
                  })}
                  {keywords && keywords.length < 10 && (
                    <span className="text-orange-600 ml-2">
                      {t("keywords.metrics.recommended")}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={showBulkAddDialog}
                  onOpenChange={setShowBulkAddDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      {t("keywords.addBulk")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("keywords.addBulk.title")}</DialogTitle>
                      <DialogDescription>
                        {t("keywords.addBulk.description", {
                          name: selectedCategory?.name || "",
                        })}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bulk-keywords">
                          {t("keywords.addBulk.label")}
                        </Label>
                        <Textarea
                          id="bulk-keywords"
                          value={bulkKeywordsText}
                          onChange={(e) => setBulkKeywordsText(e.target.value)}
                          placeholder={t("keywords.addBulk.placeholder")}
                          rows={8}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowBulkAddDialog(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        onClick={handleCreateKeywordsBulk}
                        disabled={createKeywordsBulkMutation.isPending}
                      >
                        {createKeywordsBulkMutation.isPending
                          ? t("common.adding")
                          : t("keywords.addBulk.submit")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      {t("keywords.add")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("keywords.add.title")}</DialogTitle>
                      <DialogDescription>
                        {t("keywords.add.description", {
                          name: selectedCategory?.name || "",
                        })}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="keyword">
                          {t("keywords.form.keyword")}
                        </Label>
                        <Input
                          id="keyword"
                          value={keywordForm.keyword}
                          onChange={(e) =>
                            setKeywordForm({
                              ...keywordForm,
                              keyword: e.target.value,
                            })
                          }
                          placeholder={t("keywords.form.keywordPlaceholder")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">
                          {t("keywords.form.description")}
                        </Label>
                        <Input
                          id="description"
                          value={keywordForm.description}
                          onChange={(e) =>
                            setKeywordForm({
                              ...keywordForm,
                              description: e.target.value,
                            })
                          }
                          placeholder={t("keywords.placeholder.description")}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        onClick={handleCreateKeyword}
                        disabled={createKeywordMutation.isPending}
                      >
                        {createKeywordMutation.isPending
                          ? t("common.adding")
                          : t("keywords.add.submit")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {keywordsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border border-current border-t-transparent rounded-full" />
                <span className="ml-2">{t("keywords.loading")}</span>
              </div>
            ) : (
              <>
                {keywords && keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={t("keywords.search.placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                {filteredKeywords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {keywords?.length === 0
                        ? t("keywords.empty.none")
                        : t("keywords.empty.noResults")}
                    </p>
                    {keywords?.length === 0 && (
                      <p className="text-sm mt-2">{t("keywords.empty.hint")}</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("keywords.table.keyword")}</TableHead>
                          <TableHead>
                            {t("keywords.table.description")}
                          </TableHead>
                          <TableHead>{t("keywords.table.created")}</TableHead>
                          <TableHead className="w-[100px]">
                            {t("keywords.table.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredKeywords.map((keyword) => (
                          <TableRow key={keyword.id}>
                            <TableCell>
                              <Badge variant="secondary">
                                {keyword.keyword}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {keyword.description || (
                                <span className="text-muted-foreground italic">
                                  {t("keywords.badge.noDescription")}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {formatDate(keyword.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditDialog(keyword)}
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        {t("keywords.edit.title")}
                                      </DialogTitle>
                                      <DialogDescription>
                                        {t("keywords.edit.description")}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-keyword">
                                          {t("keywords.form.keyword")}
                                        </Label>
                                        <Input
                                          id="edit-keyword"
                                          value={keywordForm.keyword}
                                          onChange={(e) =>
                                            setKeywordForm({
                                              ...keywordForm,
                                              keyword: e.target.value,
                                            })
                                          }
                                          placeholder={t(
                                            "keywords.form.keywordPlaceholder"
                                          )}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-description">
                                          {t("keywords.form.description")}
                                        </Label>
                                        <Input
                                          id="edit-description"
                                          value={keywordForm.description}
                                          onChange={(e) =>
                                            setKeywordForm({
                                              ...keywordForm,
                                              description: e.target.value,
                                            })
                                          }
                                          placeholder={t(
                                            "keywords.placeholder.description"
                                          )}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingKeyword(null)}
                                      >
                                        {t("common.cancel")}
                                      </Button>
                                      <Button
                                        onClick={handleUpdateKeyword}
                                        disabled={
                                          updateKeywordMutation.isPending
                                        }
                                      >
                                        {updateKeywordMutation.isPending
                                          ? t("common.updating")
                                          : t("keywords.edit.submit")}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {t("keywords.delete.title")}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t("keywords.delete.description", {
                                          keyword: keyword.keyword,
                                        })}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {t("common.cancel")}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteKeyword(keyword.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {deleteKeywordMutation.isPending
                                          ? t("common.deleting")
                                          : t("common.delete")}
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
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

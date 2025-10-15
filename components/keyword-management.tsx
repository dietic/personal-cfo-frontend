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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/format";
import {
  useCategoryList,
  useCreateKeyword,
  useCreateKeywordsBulk,
  useDeleteKeyword,
  useDeleteKeywordsBulk,
  useGenerateAIKeywords,
  useKeywordsByCategory,
  useSeedDefaultKeywords,
  useUpdateKeyword,
  useAIUsageStats,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function KeywordManagement() {
  const { t } = useI18n();
  const { data: categories, isLoading: categoriesLoading } = useCategoryList();
  const createKeywordMutation = useCreateKeyword();
  const createKeywordsBulkMutation = useCreateKeywordsBulk();
  const updateKeywordMutation = useUpdateKeyword();
  const deleteKeywordMutation = useDeleteKeyword();
  const deleteKeywordsBulkMutation = useDeleteKeywordsBulk();
  const seedDefaultKeywordsMutation = useSeedDefaultKeywords();
  const generateAIKeywordsMutation = useGenerateAIKeywords();
  const { data: aiUsageStats } = useAIUsageStats();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false);
  const [showAIWarningDialog, setShowAIWarningDialog] = useState(false);
  const [editingKeyword, setEditingKeyword] =
    useState<CategoryKeywordResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingCategories, setProcessingCategories] = useState<Set<string>>(new Set());
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

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

  const visibleKeywordIds = filteredKeywords.map((keyword) => keyword.id);
  const selectedCount = selectedKeywordIds.size;
  const allVisibleSelected =
    visibleKeywordIds.length > 0 &&
    visibleKeywordIds.every((id) => selectedKeywordIds.has(id));
  const someVisibleSelected =
    selectedCount > 0 && visibleKeywordIds.some((id) => selectedKeywordIds.has(id));

  useEffect(() => {
    setSelectedKeywordIds(new Set());
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!keywords) {
      setSelectedKeywordIds(new Set());
      return;
    }
    setSelectedKeywordIds((prev) => {
      const availableIds = new Set(keywords.map((kw) => kw.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (availableIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [keywords]);

  useEffect(() => {
    if (selectedCount === 0 && showBulkDeleteDialog) {
      setShowBulkDeleteDialog(false);
    }
  }, [selectedCount, showBulkDeleteDialog]);

  // Debug: Log category data to understand button visibility
  if (selectedCategory && process.env.NODE_ENV === 'development') {
    console.log('Selected category:', {
      id: selectedCategory.id,
      name: selectedCategory.name,
      is_default: selectedCategory.is_default,
      user_id: selectedCategory.user_id
    });
    console.log('AI Usage Stats:', aiUsageStats);
    console.log('Button should show:', 
      aiUsageStats && 
      aiUsageStats.plan_tier !== "free" && 
      selectedCategory && 
      !selectedCategory.is_default
    );
  }

  const toggleKeywordSelection = (keywordId: string, checked: boolean) => {
    setSelectedKeywordIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(keywordId);
      } else {
        next.delete(keywordId);
      }
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedKeywordIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredKeywords.forEach((keyword) => next.add(keyword.id));
      } else {
        filteredKeywords.forEach((keyword) => next.delete(keyword.id));
      }
      return next;
    });
  };

  const handleBulkDeleteKeywords = async () => {
    if (selectedKeywordIds.size === 0) {
      return;
    }

    try {
      await deleteKeywordsBulkMutation.mutateAsync({
        keywordIds: Array.from(selectedKeywordIds),
        categoryId: selectedCategoryId,
      });
      setSelectedKeywordIds(new Set());
      setShowBulkDeleteDialog(false);
    } catch (error) {
      // Error handled by mutation toast
    }
  };

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
      setSelectedKeywordIds((prev) => {
        if (!prev.has(keywordId)) {
          return prev;
        }
        const next = new Set(prev);
        next.delete(keywordId);
        return next;
      });
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

  const handleGenerateAIKeywords = async (clearExisting: boolean = false) => {
    if (!selectedCategoryId) {
      toast.error(t("keywords.errors.selectCategory"));
      return;
    }
    
    // Add category to processing set
    setProcessingCategories(prev => new Set(prev).add(selectedCategoryId));
    
    try {
      await generateAIKeywordsMutation.mutateAsync({ 
        categoryId: selectedCategoryId, 
        clearExisting 
      });
      setShowAIWarningDialog(false);
    } catch (error) {
      // Error handled by mutation
      setShowAIWarningDialog(false);
    } finally {
      // Remove category from processing set
      setProcessingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedCategoryId);
        return newSet;
      });
    }
  };

  const handleGenerateAIKeywordsClick = () => {
    if (!selectedCategoryId) {
      toast.error(t("keywords.errors.selectCategory"));
      return;
    }
    
    // Check if category has existing keywords and show warning dialog
    if (keywords && keywords.length > 0) {
      setShowAIWarningDialog(true);
    } else {
      // No existing keywords, proceed directly
      handleGenerateAIKeywords(false);
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
                        {category.emoji && (
                          <span className="text-base">{category.emoji}</span>
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {/* AI Keyword Generation Button - Only for Plus/Pro users and non-default categories */}
                {aiUsageStats && aiUsageStats.plan_tier !== "free" && selectedCategory && !selectedCategory.is_default && (
                  <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleGenerateAIKeywordsClick}
                        disabled={generateAIKeywordsMutation.isPending || 
                                 (aiUsageStats && aiUsageStats.remaining <= 0) ||
                                 processingCategories.has(selectedCategoryId)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {generateAIKeywordsMutation.isPending || processingCategories.has(selectedCategoryId) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {processingCategories.has(selectedCategoryId) 
                          ? t("keywords.generatingAI") 
                          : t("keywords.generateAI")
                        }
                        {aiUsageStats && (
                          <span className="text-xs ml-1">
                            ({aiUsageStats.remaining}/{aiUsageStats.monthly_limit})
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {aiUsageStats && aiUsageStats.remaining <= 0 
                          ? t("keywords.aiLimitReached")
                          : t("keywords.generateAITooltip")
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={showBulkAddDialog}
                  onOpenChange={setShowBulkAddDialog}
                >
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={processingCategories.has(selectedCategoryId)}
                    >
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
                        onClick={() => {
                          setShowBulkAddDialog(false);
                          setBulkKeywordsText("");
                        }}
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
                    <Button 
                      size="sm"
                      disabled={processingCategories.has(selectedCategoryId)}
                    >
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
                          value={keywordForm.description || ""}
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
                        onClick={() => {
                          setShowAddDialog(false);
                          resetKeywordForm();
                        }}
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
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">
                        {t("keywords.metrics.count", {
                          count: String(filteredKeywords.length),
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedCount > 0 && (
                          <Badge variant="secondary">
                            {t("keywords.bulkDelete.selectedCount", {
                              count: selectedCount,
                            })}
                          </Badge>
                        )}
                        <AlertDialog
                          open={showBulkDeleteDialog}
                          onOpenChange={setShowBulkDeleteDialog}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={
                                selectedCount === 0 ||
                                deleteKeywordsBulkMutation.isPending
                              }
                            >
                              {deleteKeywordsBulkMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              {t("keywords.bulkDelete.action")}
                              {selectedCount > 0 && (
                                <span className="ml-1 text-xs">
                                  ({selectedCount})
                                </span>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("keywords.bulkDelete.confirmTitle", {
                                  count: selectedCount,
                                })}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("keywords.bulkDelete.confirmDescription")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                disabled={deleteKeywordsBulkMutation.isPending}
                              >
                                {t("common.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleBulkDeleteKeywords}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={deleteKeywordsBulkMutation.isPending}
                              >
                                {deleteKeywordsBulkMutation.isPending
                                  ? t("common.deleting")
                                  : t("keywords.bulkDelete.action")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={
                                allVisibleSelected
                                  ? true
                                  : someVisibleSelected
                                  ? "indeterminate"
                                  : false
                              }
                              onCheckedChange={(value) =>
                                toggleSelectAll(Boolean(value))
                              }
                              aria-label={t(
                                "keywords.bulkDelete.selectAll"
                              )}
                              disabled={
                                filteredKeywords.length === 0 ||
                                deleteKeywordsBulkMutation.isPending
                              }
                            />
                          </TableHead>
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
                            <TableCell className="w-10">
                              <Checkbox
                                checked={selectedKeywordIds.has(keyword.id)}
                                onCheckedChange={(value) =>
                                  toggleKeywordSelection(
                                    keyword.id,
                                    Boolean(value)
                                  )
                                }
                                aria-label={t(
                                  "keywords.bulkDelete.selectKeyword",
                                  { keyword: keyword.keyword }
                                )}
                                disabled={deleteKeywordsBulkMutation.isPending}
                              />
                            </TableCell>
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(keyword)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>

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
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Single Edit Dialog */}
      <Dialog open={!!editingKeyword} onOpenChange={(open) => {
        if (!open) {
          setEditingKeyword(null);
          resetKeywordForm();
        }
      }}>
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
                value={keywordForm.description || ""}
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

      {/* AI Warning Dialog */}
      <AlertDialog open={showAIWarningDialog} onOpenChange={setShowAIWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("keywords.aiWarning.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("keywords.aiWarning.description", {
                count: String(keywords?.length || 0),
                name: selectedCategory?.name || ""
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleGenerateAIKeywords(false)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {t("keywords.aiWarning.keepExisting")}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleGenerateAIKeywords(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("keywords.aiWarning.clearExisting")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

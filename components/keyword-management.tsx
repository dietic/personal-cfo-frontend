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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit3,
  Trash2,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Search,
  Loader2,
} from "lucide-react";
import {
  useCategories,
  useKeywordsByCategory,
  useCreateKeyword,
  useCreateKeywordsBulk,
  useUpdateKeyword,
  useDeleteKeyword,
  useSeedDefaultKeywords,
} from "@/lib/hooks";
import {
  CategoryKeywordCreate,
  CategoryKeywordUpdate,
  CategoryKeywordResponse,
  CategoryKeywordsBulkCreate,
} from "@/lib/types";
import { toast } from "sonner";

export function KeywordManagement() {
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
      toast.error("Keyword is required");
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
      toast.error("Please enter at least one keyword");
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
      toast.error("Keyword is required");
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
            Keyword Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border border-current border-t-transparent rounded-full" />
            <span className="ml-2">Loading categories...</span>
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
            Keyword Management
          </CardTitle>
          <CardDescription>
            Manage keywords for pure keyword-based transaction categorization.
            Each category should have at least 10 keywords for effective
            matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <Label htmlFor="category-select">Select Category</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Choose a category to manage keywords" />
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
                Seed Defaults
              </Button>
            </div>
          </div>

          {!selectedCategoryId && (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a category to view and manage its keywords</p>
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
                  {selectedCategory?.name} Keywords
                </CardTitle>
                <CardDescription>
                  {keywords?.length || 0} keywords configured
                  {keywords && keywords.length < 10 && (
                    <span className="text-orange-600 ml-2">
                      (Recommended: at least 10 keywords)
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
                      Bulk Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Multiple Keywords</DialogTitle>
                      <DialogDescription>
                        Enter keywords one per line. These will be added to{" "}
                        {selectedCategory?.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bulk-keywords">
                          Keywords (one per line)
                        </Label>
                        <Textarea
                          id="bulk-keywords"
                          value={bulkKeywordsText}
                          onChange={(e) => setBulkKeywordsText(e.target.value)}
                          placeholder="restaurant&#10;food&#10;dining&#10;takeout"
                          rows={8}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowBulkAddDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateKeywordsBulk}
                        disabled={createKeywordsBulkMutation.isPending}
                      >
                        {createKeywordsBulkMutation.isPending
                          ? "Adding..."
                          : "Add Keywords"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      Add Keyword
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Keyword</DialogTitle>
                      <DialogDescription>
                        Add a keyword to help categorize transactions for{" "}
                        {selectedCategory?.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="keyword">Keyword *</Label>
                        <Input
                          id="keyword"
                          value={keywordForm.keyword}
                          onChange={(e) =>
                            setKeywordForm({
                              ...keywordForm,
                              keyword: e.target.value,
                            })
                          }
                          placeholder="e.g., restaurant, gas station, grocery"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">
                          Description (Optional)
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
                          placeholder="Brief description of this keyword"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateKeyword}
                        disabled={createKeywordMutation.isPending}
                      >
                        {createKeywordMutation.isPending
                          ? "Adding..."
                          : "Add Keyword"}
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
                <span className="ml-2">Loading keywords...</span>
              </div>
            ) : (
              <>
                {keywords && keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search keywords..."
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
                        ? "No keywords added yet"
                        : "No keywords match your search"}
                    </p>
                    {keywords?.length === 0 && (
                      <p className="text-sm mt-2">
                        Add keywords to enable pure keyword-based categorization
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
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
                                  No description
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                keyword.created_at
                              ).toLocaleDateString()}
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
                                      <DialogTitle>Edit Keyword</DialogTitle>
                                      <DialogDescription>
                                        Update the keyword details.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-keyword">
                                          Keyword *
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
                                          placeholder="e.g., restaurant, gas station, grocery"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-description">
                                          Description (Optional)
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
                                          placeholder="Brief description of this keyword"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingKeyword(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleUpdateKeyword}
                                        disabled={
                                          updateKeywordMutation.isPending
                                        }
                                      >
                                        {updateKeywordMutation.isPending
                                          ? "Updating..."
                                          : "Update Keyword"}
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
                                        Delete Keyword
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete the
                                        keyword "{keyword.keyword}"? This action
                                        cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteKeyword(keyword.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
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

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  User,
  UserProfileUpdate,
  Card,
  CardCreate,
  CardUpdate,
  BankProvider,
  BankProviderSimple,
  Category,
  CategoryCreate,
  CategoryUpdate,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  TransactionFilters,
  Budget,
  BudgetCreate,
  BudgetUpdate,
  RecurringService,
  RecurringServiceCreate,
  RecurringServiceUpdate,
  Statement,
  ExtractionRequest,
  CategorizationRequest,
  AnalyticsFilters,
  TrendsFilters,
  CategorizeTransactionParams,
  DetectAnomaliesParams,
  CategoryKeywordCreate,
  CategoryKeywordUpdate,
  CategoryKeywordsBulkCreate,
  CategoryKeywordResponse,
} from "@/lib/types";
import { toast } from "sonner";

// Query Keys
export const queryKeys = {
  userProfile: ["user", "profile"] as const,
  cards: ["cards"] as const,
  card: (id: string) => ["cards", id] as const,
  bankProviders: (country?: string, popularOnly?: boolean) => 
    ["bank-providers", country, popularOnly] as const,
  bankProvider: (id: string) => ["bank-providers", id] as const,
  categories: ["categories"] as const,
  category: (id: string) => ["categories", id] as const,
  currencies: ["currencies"] as const,
  keywords: ["keywords"] as const,
  keywordsByCategory: (categoryId: string) =>
    ["keywords", "category", categoryId] as const,
  transactions: (filters?: TransactionFilters) =>
    ["transactions", filters] as const,
  transaction: (id: string) => ["transactions", id] as const,
  budgets: ["budgets"] as const,
  budget: (id: string) => ["budgets", id] as const,
  budgetAlerts: ["budgets", "alerts"] as const,
  recurringServices: ["recurring-services"] as const,
  recurringService: (id: string) => ["recurring-services", id] as const,
  statements: ["statements"] as const,
  analytics: {
    dashboard: ["analytics", "dashboard"] as const,
    categorySpending: (filters?: AnalyticsFilters) =>
      ["analytics", "category", filters] as const,
    trends: (filters?: TrendsFilters) =>
      ["analytics", "trends", filters] as const,
    yearComparison: ["analytics", "comparison"] as const,
    insights: ["analytics", "insights"] as const,
  },
};

// User Profile Hooks
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: () => apiClient.getUserProfile(),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserProfileUpdate) => apiClient.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to update profile";
      toast.error(message);
    },
  });
}

// Cards Hooks
export function useCards() {
  return useQuery({
    queryKey: queryKeys.cards,
    queryFn: () => apiClient.getCards(),
  });
}

export function useCard(cardId: string) {
  return useQuery({
    queryKey: queryKeys.card(cardId),
    queryFn: () => apiClient.getCard(cardId),
    enabled: !!cardId,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CardCreate) => apiClient.createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards });
      toast.success("Card created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to create card";
      toast.error(message);
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: CardUpdate }) =>
      apiClient.updateCard(cardId, data),
    onSuccess: (_, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards });
      queryClient.invalidateQueries({ queryKey: queryKeys.card(cardId) });
      toast.success("Card updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to update card";
      toast.error(message);
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => apiClient.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards });
      toast.success("Card deleted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to delete card";
      toast.error(message);
    },
  });
}

// Bank Providers Hooks
export function useBankProviders(country?: string, popularOnly?: boolean) {
  return useQuery({
    queryKey: queryKeys.bankProviders(country, popularOnly),
    queryFn: () => {
      // Build query parameters
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (popularOnly) params.append('popular_only', 'true');
      
      return apiClient.getBankProviders(params.toString());
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - bank data doesn't change often
  });
}

export function useBankProvider(bankId: string) {
  return useQuery({
    queryKey: queryKeys.bankProvider(bankId),
    queryFn: () => apiClient.getBankProvider(bankId),
    enabled: !!bankId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Transactions Hooks
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => apiClient.getTransactions(filters),
  });
}

export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: queryKeys.transaction(transactionId),
    queryFn: () => apiClient.getTransaction(transactionId),
    enabled: !!transactionId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionCreate) => apiClient.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Transaction created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to create transaction";
      toast.error(message);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: TransactionUpdate;
    }) => apiClient.updateTransaction(transactionId, data),
    onSuccess: (_, { transactionId }) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.transaction(transactionId),
      });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Transaction updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to update transaction";
      toast.error(message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) =>
      apiClient.deleteTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to delete transaction";
      toast.error(message);
    },
  });
}

export function useDeleteTransactionsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionIds: string[]) =>
      apiClient.deleteTransactionsBulk(transactionIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(`${data.deleted_count} transactions deleted successfully`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to delete transactions";
      toast.error(message);
    },
  });
}

// Budgets Hooks
export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets,
    queryFn: () => apiClient.getBudgets(),
  });
}

export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: queryKeys.budget(budgetId),
    queryFn: () => apiClient.getBudget(budgetId),
    enabled: !!budgetId,
  });
}

export function useBudgetAlerts() {
  return useQuery({
    queryKey: queryKeys.budgetAlerts,
    queryFn: () => apiClient.getBudgetAlerts(),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BudgetCreate) => apiClient.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetAlerts });
      toast.success("Budget created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to create budget";
      toast.error(message);
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      budgetId,
      data,
    }: {
      budgetId: string;
      data: BudgetUpdate;
    }) => apiClient.updateBudget(budgetId, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(budgetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetAlerts });
      toast.success("Budget updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to update budget";
      toast.error(message);
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetId: string) => apiClient.deleteBudget(budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetAlerts });
      toast.success("Budget deleted successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to delete budget";
      toast.error(message);
    },
  });
}

// Recurring Services Hooks
export function useRecurringServices() {
  return useQuery({
    queryKey: queryKeys.recurringServices,
    queryFn: () => apiClient.getRecurringServices(),
  });
}

export function useRecurringService(serviceId: string) {
  return useQuery({
    queryKey: queryKeys.recurringService(serviceId),
    queryFn: () => apiClient.getRecurringService(serviceId),
    enabled: !!serviceId,
  });
}

export function useCreateRecurringService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecurringServiceCreate) =>
      apiClient.createRecurringService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringServices });
      toast.success("Recurring service created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to create recurring service";
      toast.error(message);
    },
  });
}

export function useUpdateRecurringService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      data,
    }: {
      serviceId: string;
      data: RecurringServiceUpdate;
    }) => apiClient.updateRecurringService(serviceId, data),
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringServices });
      queryClient.invalidateQueries({
        queryKey: queryKeys.recurringService(serviceId),
      });
      toast.success("Recurring service updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to update recurring service";
      toast.error(message);
    },
  });
}

export function useDeleteRecurringService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) =>
      apiClient.deleteRecurringService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringServices });
      toast.success("Recurring service deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to delete recurring service";
      toast.error(message);
    },
  });
}

// Statements Hooks
export function useStatements() {
  return useQuery({
    queryKey: queryKeys.statements,
    queryFn: () => apiClient.getStatements(),
  });
}

export function useDeleteStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statementId: string) => apiClient.deleteStatement(statementId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(
        `Statement deleted. ${data.transactions_deleted} transactions also removed.`
      );
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to delete statement";
      toast.error(message);
    },
  });
}

export function useUploadStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, cardId }: { file: File; cardId?: string }) =>
      apiClient.uploadStatement(file, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      toast.success("Statement uploaded successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to upload statement";
      toast.error(message);
    },
  });
}

export function useUploadStatementSimple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, cardId }: { file: File; cardId: string }) => apiClient.uploadStatementSimple(file, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Statement processed successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to process statement";
      toast.error(message);
    },
  });
}

export function useProcessStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      cardId,
    }: {
      statementId: string;
      cardId: string;
    }) => apiClient.processStatement(statementId, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Statement processed successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to process statement";
      toast.error(message);
    },
  });
}

export function useStatementStatus(
  statementId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["statements", statementId, "status"],
    queryFn: () => apiClient.getStatementStatus(statementId),
    enabled: enabled && !!statementId,
    refetchInterval: 2000, // Poll every 2 seconds when enabled
  });
}

export function useExtractTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      data,
    }: {
      statementId: string;
      data: ExtractionRequest;
    }) => apiClient.extractTransactions(statementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to extract transactions";
      toast.error(message);
    },
  });
}

export function useCategorizeTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      data,
    }: {
      statementId: string;
      data: CategorizationRequest;
    }) => apiClient.categorizeTransactions(statementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to categorize transactions";
      toast.error(message);
    },
  });
}

export function useRecategorizeTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      data,
    }: {
      statementId: string;
      data: CategorizationRequest;
    }) => apiClient.recategorizeTransactions(statementId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      const totalProcessed = data.transactions_categorized + data.uncategorized;
      toast.success(`Recategorized ${data.transactions_categorized} of ${totalProcessed} transactions`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to recategorize transactions";
      toast.error(message);
    },
  });
}

export function useRetryStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statementId: string) => apiClient.retryStatement(statementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to retry statement";
      toast.error(message);
    },
  });
}

// Analytics Hooks
export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: () => apiClient.getAnalyticsDashboard(),
  });
}

export function useCategorySpending(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.categorySpending(filters),
    queryFn: () => apiClient.getCategorySpending(filters),
  });
}

export function useSpendingTrends(filters?: TrendsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.trends(filters),
    queryFn: () => apiClient.getSpendingTrends(filters),
  });
}

export function useYearComparison() {
  return useQuery({
    queryKey: queryKeys.analytics.yearComparison,
    queryFn: () => apiClient.getYearComparison(),
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: queryKeys.analytics.insights,
    queryFn: () => apiClient.getAIInsights(),
  });
}

// AI Hooks
export function useCategorizeTransaction() {
  return useMutation({
    mutationFn: (params: CategorizeTransactionParams) =>
      apiClient.categorizeTransaction(params),
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to categorize transaction";
      toast.error(message);
    },
  });
}

export function useAnalyzeSpendingPatterns() {
  return useMutation({
    mutationFn: () => apiClient.analyzeSpendingPatterns(),
    onSuccess: () => {
      toast.success("Spending analysis completed");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to analyze spending patterns";
      toast.error(message);
    },
  });
}

export function useDetectTransactionAnomalies() {
  return useMutation({
    mutationFn: (params: DetectAnomaliesParams) =>
      apiClient.detectTransactionAnomalies(params),
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to detect anomalies";
      toast.error(message);
    },
  });
}

// Categories Hooks
export function useCategories(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...queryKeys.categories, { includeInactive }],
    queryFn: () => apiClient.getCategories(includeInactive),
  });
}

export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.category(categoryId),
    queryFn: () => apiClient.getCategory(categoryId),
    enabled: !!categoryId,
  });
}

// Currencies Hooks
export function useCurrencies() {
  return useQuery({
    queryKey: queryKeys.currencies,
    queryFn: () => apiClient.getCurrencies(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreate) => apiClient.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to create category";
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: CategoryUpdate;
    }) => apiClient.updateCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to update category";
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => apiClient.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to delete category";
      toast.error(message);
    },
  });
}

// Categories validation hook (working fallback)
export function useCategoriesValidation() {
  return useQuery({
    queryKey: ["categories", "validation"],
    queryFn: () => apiClient.validateCategoriesMinimum(),
    staleTime: 30000, // 30 seconds
  });
}

// Keywords Hooks
export function useKeywordsByCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.keywordsByCategory(categoryId),
    queryFn: () => apiClient.getKeywordsByCategory(categoryId),
    enabled: !!categoryId,
  });
}

export function useCreateKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryKeywordCreate) => apiClient.createKeyword(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      queryClient.invalidateQueries({
        queryKey: queryKeys.keywordsByCategory(variables.category_id),
      });
      toast.success("Keyword created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to create keyword";
      toast.error(message);
    },
  });
}

export function useCreateKeywordsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryKeywordsBulkCreate) =>
      apiClient.createKeywordsBulk(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      queryClient.invalidateQueries({
        queryKey: queryKeys.keywordsByCategory(variables.category_id),
      });
      toast.success("Keywords created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to create keywords";
      toast.error(message);
    },
  });
}

export function useUpdateKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      keywordId,
      data,
    }: {
      keywordId: string;
      data: CategoryKeywordUpdate;
    }) => apiClient.updateKeyword(keywordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      toast.success("Keyword updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to update keyword";
      toast.error(message);
    },
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keywordId: string) => apiClient.deleteKeyword(keywordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      toast.success("Keyword deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to delete keyword";
      toast.error(message);
    },
  });
}

export function useSeedDefaultKeywords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.seedDefaultKeywords(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Default keywords seeded successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to seed default keywords";
      toast.error(message);
    },
  });
}

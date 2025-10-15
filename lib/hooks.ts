"use client";

import { apiClient } from "@/lib/api-client";
import { getExchangeRate, type ExchangeRateInfo } from "@/lib/exchange-rates";
import { tInstant } from "@/lib/i18n";
import {
  AdminUsersParams,
  AnalyticsFilters,
  BudgetCreate,
  BudgetUpdate,
  CardCreate,
  CardUpdate,
  CategorizationRequest,
  CategorizeTransactionParams,
  CategoryCreate,
  CategoryKeywordCreate,
  CategoryKeywordUpdate,
  CategoryKeywordsBulkCreate,
  CategoryUpdate,
  DetectAnomaliesParams,
  ExtractionRequest,
  RecurringServiceCreate,
  RecurringServiceUpdate,
  SignupStatsResponse,
  ToggleUserActiveResponse,
  TransactionCreate,
  TransactionFilters,
  TransactionUpdate,
  TrendsFilters,
  User,
  UserProfileUpdate,
  UserPasswordUpdate,
} from "@/lib/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
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
    monthlyCategories: (filters?: TrendsFilters) =>
      ["analytics", "monthly-categories", filters] as const,
    yearComparison: ["analytics", "comparison"] as const,
    insights: ["analytics", "insights"] as const,
  },
  admin: {
    users: (params?: AdminUsersParams) => ["admin", "users", params] as const,
    signupStats: (start?: string, end?: string, tz: string = "America/Lima") =>
      ["admin", "signup-stats", { start, end, tz }] as const,
  },
  exchangeRate: ["exchange-rate"] as const,
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
      toast.success(tInstant("profile.updatedSuccessfully", undefined));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("profile.updateFailed");
      toast.error(message);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: UserPasswordUpdate) => apiClient.changePassword(data),
    onSuccess: () => {
      toast.success(tInstant("profile.password.changed"));
    },
    onError: (error: any) => {
      console.error("Password change error:", error);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      console.error("Error response data:", error.response?.data);
      console.error("Error response data type:", typeof error.response?.data);
      console.error("Error message:", error.message);
      
      let message = tInstant("profile.password.failed");
      
      // Check if this is a network error (no response)
      if (!error.response) {
        message = tInstant("profile.password.networkError");
        console.error("Network error - request may not have reached backend");
      }
      // Handle different error response formats
      else if (error.response?.data) {
        const responseData = error.response.data;
        
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData.detail && typeof responseData.detail === 'string') {
          message = responseData.detail;
        } else if (responseData.message && typeof responseData.message === 'string') {
          message = responseData.message;
        } else if (typeof responseData === 'object') {
          // Try to stringify the object for debugging
          try {
            message = JSON.stringify(responseData);
          } catch (e) {
            console.error("Could not stringify error response:", e);
          }
        } else {
          console.error("Unhandled error response format:", responseData);
        }
      } else if (error.message && typeof error.message === 'string') {
        message = error.message;
      }
      
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
      toast.success(tInstant("card.createdSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("card.createFailed");
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
      toast.success(tInstant("card.updatedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("card.updateFailed");
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
      toast.success(tInstant("card.deletedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("card.deleteFailed");
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
      if (country) params.append("country", country);
      if (popularOnly) params.append("popular_only", "true");

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
      toast.success(tInstant("transaction.createdSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("transaction.createFailed");
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
        queryKey: { queryKey: queryKeys.transaction(transactionId) } as any,
      });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(tInstant("transaction.updatedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("transaction.updateFailed");
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
      toast.success(tInstant("transaction.deletedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("transaction.deleteFailed");
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
      toast.success(tInstant("budget.createdSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("budget.createFailed");
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
    onSuccess: (
      _: any,
      { budgetId }: { budgetId: string; data: BudgetUpdate }
    ) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(budgetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetAlerts });
      toast.success(tInstant("budget.updatedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("budget.updateFailed");
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
      toast.success(tInstant("budget.deletedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("budget.deleteFailed");
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
      toast.success(tInstant("recurring.createdSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("recurring.createFailed");
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
    onSuccess: (
      _: any,
      { serviceId }: { serviceId: string; data: RecurringServiceUpdate }
    ) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurringServices });
      queryClient.invalidateQueries({
        queryKey: queryKeys.recurringService(serviceId),
      });
      toast.success(tInstant("recurring.updatedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("recurring.updateFailed");
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
      toast.success(tInstant("recurring.deletedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("recurring.deleteFailed");
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
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(
        tInstant("statement.deletedSummary", {
          count: String(data.transactions_deleted || 0),
        })
      );
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("statement.deleteFailed");
      toast.error(message);
    },
  });
}

// NEW: Bulk delete statements
export function useDeleteStatementsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statementIds: string[]) => {
      let successCount = 0;
      let transactionsDeleted = 0;
      const failedIds: string[] = [];
      const successIds: string[] = [];

      for (const id of statementIds) {
        try {
          const res = await apiClient.deleteStatement(id);
          successCount += 1;
          transactionsDeleted += res.transactions_deleted || 0;
          successIds.push(id);
        } catch (_err) {
          failedIds.push(id);
        }
      }

      const failureCount = failedIds.length;
      return {
        successCount,
        failureCount,
        transactionsDeleted,
        total: statementIds.length,
        failedIds,
        successIds,
      };
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });

      if (result.successCount > 0) {
        toast.success(
          tInstant("statement.bulkDeleted", {
            success: String(result.successCount),
            tx: String(result.transactionsDeleted),
          })
        );
      }
      if (result.failureCount > 0) {
        toast.warning(
          tInstant("statement.bulkFailed", {
            failed: String(result.failureCount),
            total: String(result.total),
          })
        );
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("statement.bulkDeleteFailed");
      toast.error(message);
    },
  });
}

// Bulk delete incomes
export function useDeleteIncomesBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incomeIds: string[]) => {
      let successCount = 0;
      const failedIds: string[] = [];
      const successIds: string[] = [];

      for (const id of incomeIds) {
        try {
          await apiClient.deleteIncome(id);
          successCount += 1;
          successIds.push(id);
        } catch (_err) {
          failedIds.push(id);
        }
      }

      const failureCount = failedIds.length;
      return {
        successCount,
        failureCount,
        total: incomeIds.length,
        failedIds,
        successIds,
      };
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });

      if (result.successCount > 0) {
        toast.success(
          tInstant("income.bulkDeleted", {
            success: String(result.successCount),
          })
        );
      }
      if (result.failureCount > 0) {
        toast.warning(
          tInstant("income.bulkFailed", {
            failed: String(result.failureCount),
            total: String(result.total),
          })
        );
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("income.bulkDeleteFailed");
      toast.error(message);
    },
  });
}

export function useUploadStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, cardId }: { file: File; cardId?: string }) =>
      apiClient.uploadStatement(file, cardId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      toast.success(tInstant("statement.uploadedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("statement.uploadFailed");
      toast.error(message);
    },
  });
}

export function useUploadStatementSimple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      cardId,
      password,
    }: {
      file: File;
      cardId: string;
      password?: string;
    }) => apiClient.uploadStatementSimple(file, cardId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(tInstant("statement.processedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("statement.processFailed");
      toast.error(message);
    },
  });
}

// NEW: Async upload hook - returns immediately, processes in background
export function useUploadStatementAsync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      cardId,
      password,
    }: {
      file: File;
      cardId: string;
      password?: string;
    }) => apiClient.uploadStatementAsync(file, cardId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("statement.uploadFailed");
      toast.error(message);
    },
  });
}

export function useCheckPDFAccessibility() {
  return useMutation({
    mutationFn: (file: File) => apiClient.checkPDFAccessibility(file),
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("statement.checkPDFFailed");
      toast.error(message);
    },
  });
}

export function useUnlockAndUploadPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      password,
      cardId,
    }: {
      file: File;
      password: string;
      cardId: string;
    }) => apiClient.unlockAndUploadPDF(file, password, cardId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(tInstant("pdf.unlockedProcessed"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("pdf.unlockFailed");
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
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(tInstant("statement.processedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("statement.processFailed");
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
    onSuccess: (data: {
      transactions_categorized: number;
      uncategorized: number;
    }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      const totalProcessed = data.transactions_categorized + data.uncategorized;
      toast.success(
        `Recategorized ${data.transactions_categorized} of ${totalProcessed} transactions`
      );
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

export function useMonthlyCategoryBreakdown(filters?: TrendsFilters) {
  return useQuery({
    queryKey: queryKeys.analytics.monthlyCategories(filters),
    queryFn: () => apiClient.getMonthlyCategoryBreakdown(filters),
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

// NEW: Exchange Rate hook
export function useExchangeRate() {
  return useQuery<ExchangeRateInfo>({
    queryKey: queryKeys.exchangeRate,
    queryFn: () => getExchangeRate(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24,
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
      toast.success(tInstant("insights.completed"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("insights.failed");
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
        error.response?.data?.detail || tInstant("anomalies.failed");
      toast.error(message);
    },
  });
}

// Categories Hooks
export function useCategories(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...queryKeys.categories, { includeInactive }],
    queryFn: () => apiClient.getCategories(includeInactive, false),
  });
}

// Returns only the array of categories (for selectors, dropdowns, etc.)
export function useCategoryList(includeInactive: boolean = false, includeSystem: boolean = false) {
  return useQuery({
    queryKey: [...queryKeys.categories, { includeInactive, includeSystem }, "list"],
    queryFn: () => apiClient.getCategories(includeInactive, includeSystem),
    select: (data) => data.categories,
  });
}

export function useCategoryPermissions() {
  return useQuery({
    queryKey: ["categories", "permissions"],
    queryFn: () => apiClient.getCategoryPermissions(),
    staleTime: 60000, // 1 minute
  });
}

export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.category(categoryId),
    queryFn: () => apiClient.getCategory(categoryId),
    enabled: !!categoryId,
  });
}

// Custom hook to get category color mapping
export function useCategoryColors() {
  const { data: categories } = useCategoryList();

  const getCategoryColor = (categoryName?: string | null) => {
    if (!categoryName || !categories) return "#64748b"; // Default color

    // Special handling for Income category
    if (categoryName.toLowerCase() === "income") {
      return "#4f46e5"; // Modern indigo color
    }

    const category = categories.find((cat: any) => cat.name === categoryName);
    return category?.color || "#64748b"; // Default color if not found
  };

  const getCategoryBadgeStyle = (categoryName?: string | null) => {
    const color = getCategoryColor(categoryName);
    return {
      backgroundColor: color + "20", // 20% opacity
      color: color,
      borderColor: color + "40", // 40% opacity
    };
  };

  const getCategoryEmoji = (categoryName?: string | null) => {
    if (!categoryName || !categories) return null;

    // Special handling for Income category
    if (categoryName.toLowerCase() === "income") {
      return "💰"; // Stack of dollar bills emoji
    }

    const category = categories.find((cat: any) => cat.name === categoryName);
    return category?.emoji || null;
  };

  return {
    getCategoryColor,
    getCategoryBadgeStyle,
    getCategoryEmoji,
    categories,
  };
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
      toast.success(tInstant("category.createdSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("category.createFailed");
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
      toast.success(tInstant("category.updatedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("category.updateFailed");
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
      toast.success(tInstant("category.deletedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("category.deleteFailed");
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

// Removed categories minimum-keywords validation hook per request

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
      toast.success(tInstant("keyword.createdSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("keyword.createFailed");
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
      toast.success(tInstant("keyword.bulkCreatedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("keyword.bulkCreateFailed");
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
      toast.success(tInstant("keyword.updatedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("keyword.updateFailed");
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
      toast.success(tInstant("keyword.deletedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("keyword.deleteFailed");
      toast.error(message);
    },
  });
}

export function useDeleteKeywordsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      keywordIds,
      categoryId,
    }: {
      keywordIds: string[];
      categoryId?: string;
    }) => apiClient.deleteKeywordsBulk(keywordIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      if (variables.categoryId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.keywordsByCategory(variables.categoryId),
        });
      }
      toast.success(tInstant("keyword.bulkDeletedSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("keyword.bulkDeleteFailed");
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
      toast.success(tInstant("keyword.seededDefaultsSuccessfully"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("keyword.seedDefaultsFailed");
      toast.error(message);
    },
  });
}

// AI Keyword Generation Hooks
export function useGenerateAIKeywords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, clearExisting }: { categoryId: string; clearExisting?: boolean }) => {
      const response = await apiClient.generateAIKeywords(categoryId, clearExisting);
      
      // If this is a background task, start polling for completion
      if (response.task_id) {
        return await pollTaskCompletion(response.task_id, categoryId, queryClient);
      }
      
      return response;
    },
    onSuccess: (data, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.keywordsByCategory(categoryId) 
      });
      queryClient.invalidateQueries({ queryKey: ["ai-usage-stats"] });
      toast.success(data.message || "AI keywords generated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || tInstant("keyword.aiGenerationFailed");
      toast.error(message);
    },
  });
}

async function pollTaskCompletion(taskId: string, categoryId: string, queryClient: QueryClient) {
  const maxAttempts = 60; // 5 minutes max (5 seconds * 60 = 300 seconds)
  const delay = 5000; // 5 seconds between polls
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const taskStatus = await apiClient.getTaskStatus(taskId);
      
      if (taskStatus.status === 'SUCCESS') {
        // Task completed successfully
        queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.keywordsByCategory(categoryId) 
        });
        queryClient.invalidateQueries({ queryKey: ["ai-usage-stats"] });
        
        return {
          message: `Generated ${taskStatus.result?.keywords_added || 0} AI keywords`,
          keywords_added: taskStatus.result?.keywords_added || 0,
          category_id: categoryId,
          category_name: taskStatus.result?.category_name || ""
        };
      }
      
      if (taskStatus.status === 'FAILURE') {
        throw new Error("AI keyword generation failed in background");
      }
      
      // Task still running, continue polling
    } catch (error) {
      console.error("Error polling task status:", error);
      // Continue polling on error (might be temporary network issue)
    }
  }
  
  throw new Error("AI keyword generation timed out");
}

export function useAIUsageStats() {
  return useQuery({
    queryKey: ["ai-usage-stats"],
    queryFn: () => apiClient.getAIUsageStats(),
    staleTime: 30000, // 30 seconds
  });
}

// Admin Hooks
export function useAdminUsers(params?: AdminUsersParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => apiClient.adminListUsers(params ?? {}),
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiClient.adminToggleUserActive(userId, isActive),
    onMutate: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });
      const prev = queryClient.getQueriesData<User[]>({
        queryKey: ["admin", "users"],
      });
      // Optimistic update across all cached admin user lists
      prev.forEach(([key, users]: [QueryKey, User[] | undefined]) => {
        if (!users) return;
        const updated = users.map((u: User) =>
          u.id === userId ? { ...u, is_active: isActive } : u
        );
        queryClient.setQueryData<User[]>(key, updated);
      });
      return { prev } as { prev: Array<[QueryKey, User[] | undefined]> };
    },
    onError: (
      _err: any,
      _vars: { userId: string; isActive: boolean },
      context?: { prev: Array<[QueryKey, User[] | undefined]> }
    ) => {
      // Rollback
      context?.prev?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData<User[]>(key, data);
      });
      toast.error(tInstant("admin.userStatusUpdateFailed"));
    },
    onSuccess: (_data: ToggleUserActiveResponse) => {
      toast.success(tInstant("admin.userStatusUpdated"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      updateData,
    }: {
      userId: string;
      updateData: { is_admin?: boolean; plan_tier?: string; is_active?: boolean };
    }) => apiClient.adminUpdateUser(userId, updateData),
    onMutate: async ({
      userId,
      updateData,
    }: {
      userId: string;
      updateData: { is_admin?: boolean; plan_tier?: string; is_active?: boolean };
    }) => {
      // Cancel all admin user queries (with any params)
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });
      const prev = queryClient.getQueriesData<User[]>({
        queryKey: ["admin", "users"],
      });
      // Optimistic update across all cached admin user lists
      prev.forEach(([key, users]: [QueryKey, User[] | undefined]) => {
        if (!users) return;
        const updated = users.map((u: User) =>
          u.id === userId ? { ...u, ...updateData } : u
        );
        queryClient.setQueryData<User[]>(key, updated);
      });
      return { prev } as { prev: Array<[QueryKey, User[] | undefined]> };
    },
    onError: (
      _err: any,
      _vars: { userId: string; updateData: any },
      context?: { prev: Array<[QueryKey, User[] | undefined]> }
    ) => {
      // Rollback
      context?.prev?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData<User[]>(key, data);
      });
      toast.error(tInstant("admin.userUpdateFailed"));
    },
    onSuccess: (_data: User) => {
      toast.success(tInstant("admin.userUpdated"));
    },
    onSettled: () => {
      // Invalidate all admin user queries regardless of params
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminSignupStats(
  start?: string,
  end?: string,
  tz: string = "America/Lima"
) {
  return useQuery<SignupStatsResponse>({
    queryKey: queryKeys.admin.signupStats(start, end, tz),
    queryFn: () => apiClient.adminSignupStats(start, end, tz),
  });
}

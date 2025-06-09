"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Card,
  CardCreate,
  CardUpdate,
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
  RetryRequest,
  AnalyticsFilters,
  TrendsFilters,
  CategorizeTransactionParams,
  DetectAnomaliesParams,
} from "@/lib/types";
import { toast } from "sonner";

// Query Keys
export const queryKeys = {
  cards: ["cards"] as const,
  card: (id: string) => ["cards", id] as const,
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

export function useProcessStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      cardId,
      cardName,
    }: {
      statementId: string;
      cardId?: string;
      cardName?: string;
    }) => apiClient.processStatement(statementId, cardId, cardName),
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

// New hooks for multi-step statement processing
export function useStatementStatus(statementId: string, enabled = true) {
  return useQuery({
    queryKey: ["statement-status", statementId],
    queryFn: () => apiClient.getStatementStatus(statementId),
    enabled: enabled && !!statementId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if statement is still processing
      const data = query.state.data;
      if (data?.status === "processing" || 
          data?.extraction_status === "processing" || 
          data?.categorization_status === "processing") {
        return 2000;
      }
      return false;
    },
  });
}

export function useExtractTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      request,
    }: {
      statementId: string;
      request: ExtractionRequest;
    }) => apiClient.extractTransactions(statementId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["statement-status", variables.statementId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      toast.success(`Extraction started! Found ${data.transactions_found} transactions.`);
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
      request,
    }: {
      statementId: string;
      request: CategorizationRequest;
    }) => apiClient.categorizeTransactions(statementId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["statement-status", variables.statementId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(`Categorization complete! Categorized ${data.transactions_categorized} transactions.`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to categorize transactions";
      toast.error(message);
    },
  });
}

export function useRetryProcessingStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      request,
    }: {
      statementId: string;
      request: RetryRequest;
    }) => apiClient.retryProcessingStep(statementId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["statement-status", variables.statementId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.statements });
      toast.success("Processing step retried successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to retry processing step";
      toast.error(message);
    },
  });
}

export function useStatementInsights(statementId: string, enabled = true) {
  return useQuery({
    queryKey: ["statement-insights", statementId],
    queryFn: () => apiClient.getStatementInsights(statementId),
    enabled: enabled && !!statementId,
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

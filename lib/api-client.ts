import axios, { AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  Token,
  User,
  UserCreate,
  UserLogin,
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
  BudgetAlert,
  RecurringService,
  RecurringServiceCreate,
  RecurringServiceUpdate,
  Statement,
  StatementProcess,
  StatementStatusResponse,
  ExtractionRequest,
  ExtractionResponse,
  CategorizationRequest,
  CategorizationResponse,
  AnalyticsResponse,
  CategorySpending,
  SpendingTrend,
  YearComparison,
  AIInsight,
  AnalyticsFilters,
  TrendsFilters,
  CategorizeTransactionParams,
  DetectAnomaliesParams,
  CategoryKeyword,
  CategoryKeywordCreate,
  CategoryKeywordUpdate,
  CategoryKeywordsBulkCreate,
  CategoryKeywordResponse,
  NetworkProvider,
  NetworkProviderCreate,
  NetworkProviderUpdate,
  CardType,
  CardTypeCreate,
  CardTypeUpdate,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "access_token";

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for token refresh and error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          // Skip redirect in development for testing purposes
          const isDevelopment = process.env.NODE_ENV === "development";
          const currentPath =
            typeof window !== "undefined" ? window.location.pathname : "";

          if (!isDevelopment || !currentPath.startsWith("/transactions")) {
            // Redirect to login or dispatch logout action
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  setToken(token: string): void {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7,
      secure: true,
      sameSite: "strict",
    });
  }

  getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
  }

  removeToken(): void {
    Cookies.remove(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Authentication endpoints
  async register(data: UserCreate): Promise<User> {
    const response = await this.client.post<User>(
      "/api/v1/auth/register",
      data
    );
    return response.data;
  }

  async login(data: UserLogin): Promise<Token> {
    const response = await this.client.post<Token>("/api/v1/auth/login", data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async refreshToken(): Promise<Token> {
    const response = await this.client.post<Token>("/api/v1/auth/refresh");
    this.setToken(response.data.access_token);
    return response.data;
  }

  logout(): void {
    this.removeToken();
  }

  // User profile endpoints
  async getUserProfile(): Promise<User> {
    const response = await this.client.get<User>('/api/v1/users/profile');
    return response.data;
  }

  async updateUserProfile(data: UserProfileUpdate): Promise<User> {
    const response = await this.client.put<User>('/api/v1/users/profile', data);
    return response.data;
  }

  // Cards endpoints
  async getCards(): Promise<Card[]> {
    const response = await this.client.get<Card[]>("/api/v1/cards/");
    return response.data;
  }

  async getCard(cardId: string): Promise<Card> {
    const response = await this.client.get<Card>(`/api/v1/cards/${cardId}`);
    return response.data;
  }

  async createCard(data: CardCreate): Promise<Card> {
    const response = await this.client.post<Card>("/api/v1/cards/", data);
    return response.data;
  }

  async updateCard(cardId: string, data: CardUpdate): Promise<Card> {
    const response = await this.client.put<Card>(
      `/api/v1/cards/${cardId}`,
      data
    );
    return response.data;
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.client.delete(`/api/v1/cards/${cardId}`);
  }

  // Bank Providers endpoints
  async getBankProviders(queryParams?: string): Promise<BankProviderSimple[]> {
    const url = queryParams 
      ? `/api/v1/bank-providers/?${queryParams}` 
      : "/api/v1/bank-providers/";
    const response = await this.client.get<BankProviderSimple[]>(url);
    return response.data;
  }

  async getBankProvider(bankId: string): Promise<BankProvider> {
    const response = await this.client.get<BankProvider>(
      `/api/v1/bank-providers/${bankId}`
    );
    return response.data;
  }

  // Categories endpoints
  async getCategories(includeInactive: boolean = false): Promise<Category[]> {
    const response = await this.client.get<Category[]>("/api/v1/categories/", {
      params: { include_inactive: includeInactive },
    });
    return response.data;
  }

  async getCategory(categoryId: string): Promise<Category> {
    const response = await this.client.get<Category>(
      `/api/v1/categories/${categoryId}`
    );
    return response.data;
  }

  async createCategory(data: CategoryCreate): Promise<Category> {
    const response = await this.client.post<Category>(
      "/api/v1/categories/",
      data
    );
    return response.data;
  }

  async updateCategory(
    categoryId: string,
    data: CategoryUpdate
  ): Promise<Category> {
    const response = await this.client.put<Category>(
      `/api/v1/categories/${categoryId}`,
      data
    );
    return response.data;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.client.delete(`/api/v1/categories/${categoryId}`);
  }

  // Categories validation endpoint (working fallback)
  async validateCategoriesMinimum(): Promise<{
    has_minimum: boolean;
    current_count: number;
    minimum_required: number;
    message: string;
  }> {
    const response = await this.client.get(
      "/api/v1/categories/validate-minimum"
    );
    return response.data;
  }

  // Currencies endpoints
  async getCurrencies(): Promise<string[]> {
    const response = await this.client.get<string[]>("/api/v1/currencies");
    return response.data;
  }

  // Transactions endpoints
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const response = await this.client.get<Transaction[]>(
      "/api/v1/transactions/",
      {
        params: filters,
      }
    );
    return response.data;
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await this.client.get<Transaction>(
      `/api/v1/transactions/${transactionId}`
    );
    return response.data;
  }

  async createTransaction(data: TransactionCreate): Promise<Transaction> {
    const response = await this.client.post<Transaction>(
      "/api/v1/transactions/",
      data
    );
    return response.data;
  }

  async updateTransaction(
    transactionId: string,
    data: TransactionUpdate
  ): Promise<Transaction> {
    const response = await this.client.put<Transaction>(
      `/api/v1/transactions/${transactionId}`,
      data
    );
    return response.data;
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    await this.client.delete(`/api/v1/transactions/${transactionId}`);
  }

  async deleteTransactionsBulk(
    transactionIds: string[]
  ): Promise<{ message: string; deleted_count: number }> {
    const response = await this.client.delete<{
      message: string;
      deleted_count: number;
    }>("/api/v1/transactions/bulk", {
      data: { transaction_ids: transactionIds },
    });
    return response.data;
  }

  // Budgets endpoints
  async getBudgets(): Promise<Budget[]> {
    const response = await this.client.get<Budget[]>("/api/v1/budgets/");
    return response.data;
  }

  async getBudget(budgetId: string): Promise<Budget> {
    const response = await this.client.get<Budget>(
      `/api/v1/budgets/${budgetId}`
    );
    return response.data;
  }

  async createBudget(data: BudgetCreate): Promise<Budget> {
    const response = await this.client.post<Budget>("/api/v1/budgets/", data);
    return response.data;
  }

  async updateBudget(budgetId: string, data: BudgetUpdate): Promise<Budget> {
    const response = await this.client.put<Budget>(
      `/api/v1/budgets/${budgetId}`,
      data
    );
    return response.data;
  }

  async deleteBudget(budgetId: string): Promise<void> {
    await this.client.delete(`/api/v1/budgets/${budgetId}`);
  }

  async getBudgetAlerts(): Promise<BudgetAlert[]> {
    const response = await this.client.get<BudgetAlert[]>(
      "/api/v1/budgets/alerts"
    );
    return response.data;
  }

  // Recurring Services endpoints
  async getRecurringServices(): Promise<RecurringService[]> {
    const response = await this.client.get<RecurringService[]>(
      "/api/v1/recurring-services/"
    );
    return response.data;
  }

  async getRecurringService(serviceId: string): Promise<RecurringService> {
    const response = await this.client.get<RecurringService>(
      `/api/v1/recurring-services/${serviceId}`
    );
    return response.data;
  }

  async createRecurringService(
    data: RecurringServiceCreate
  ): Promise<RecurringService> {
    const response = await this.client.post<RecurringService>(
      "/api/v1/recurring-services/",
      data
    );
    return response.data;
  }

  async updateRecurringService(
    serviceId: string,
    data: RecurringServiceUpdate
  ): Promise<RecurringService> {
    const response = await this.client.put<RecurringService>(
      `/api/v1/recurring-services/${serviceId}`,
      data
    );
    return response.data;
  }

  async deleteRecurringService(serviceId: string): Promise<void> {
    await this.client.delete(`/api/v1/recurring-services/${serviceId}`);
  }

  // Statements endpoints
  async uploadStatement(file: File, cardId?: string): Promise<Statement> {
    const formData = new FormData();
    formData.append("file", file);

    const params = cardId ? { card_id: cardId } : undefined;

    const response = await this.client.post<Statement>(
      "/api/v1/statements/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params,
      }
    );
    return response.data;
  }

  // New simplified statement upload (extract + categorize in one step)
  async uploadStatementSimple(file: File, cardId: string): Promise<Statement> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("card_id", cardId);

    const response = await this.client.post<Statement>(
      "/api/v1/statements/upload-simple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async getStatements(): Promise<Statement[]> {
    const response = await this.client.get<Statement[]>("/api/v1/statements/");
    return response.data;
  }

  async deleteStatement(statementId: string): Promise<{
    message: string;
    transactions_deleted: number;
    statement_id: string;
  }> {
    const response = await this.client.delete<{
      message: string;
      transactions_deleted: number;
      statement_id: string;
    }>(`/api/v1/statements/${statementId}`);
    return response.data;
  }

  async processStatement(
    statementId: string,
    cardId: string
  ): Promise<StatementProcess> {
    const response = await this.client.post<StatementProcess>(
      `/api/v1/statements/${statementId}/process`,
      null,
      {
        params: { card_id: cardId },
      }
    );
    return response.data;
  }

  async getStatementStatus(
    statementId: string
  ): Promise<StatementStatusResponse> {
    const response = await this.client.get<StatementStatusResponse>(
      `/api/v1/statements/${statementId}/status`
    );
    return response.data;
  }

  async extractTransactions(
    statementId: string,
    data: ExtractionRequest
  ): Promise<ExtractionResponse> {
    const response = await this.client.post<ExtractionResponse>(
      `/api/v1/statements/${statementId}/extract`,
      data
    );
    return response.data;
  }

  async categorizeTransactions(
    statementId: string,
    data: CategorizationRequest
  ): Promise<CategorizationResponse> {
    const response = await this.client.post<CategorizationResponse>(
      `/api/v1/statements/${statementId}/categorize`,
      data
    );
    return response.data;
  }

  async recategorizeTransactions(
    statementId: string,
    data: CategorizationRequest
  ): Promise<CategorizationResponse> {
    const response = await this.client.post<CategorizationResponse>(
      `/api/v1/statements/${statementId}/recategorize`,
      data
    );
    return response.data;
  }

  async retryStatement(statementId: string): Promise<any> {
    const response = await this.client.post(
      `/api/v1/statements/${statementId}/retry`
    );
    return response.data;
  }

  // Analytics endpoints
  async getCategorySpending(
    filters?: AnalyticsFilters
  ): Promise<CategorySpending[]> {
    const response = await this.client.get<CategorySpending[]>(
      "/api/v1/analytics/category",
      {
        params: filters,
      }
    );
    return response.data;
  }

  async getSpendingTrends(filters?: TrendsFilters): Promise<SpendingTrend[]> {
    const response = await this.client.get<SpendingTrend[]>(
      "/api/v1/analytics/trends",
      {
        params: filters,
      }
    );
    return response.data;
  }

  async getYearComparison(): Promise<YearComparison> {
    const response = await this.client.get<YearComparison>(
      "/api/v1/analytics/comparison"
    );
    return response.data;
  }

  async getAIInsights(): Promise<AIInsight[]> {
    const response = await this.client.get<AIInsight[]>(
      "/api/v1/analytics/insights"
    );
    return response.data;
  }

  async getAnalyticsDashboard(): Promise<AnalyticsResponse> {
    const response = await this.client.get<AnalyticsResponse>(
      "/api/v1/analytics/"
    );
    return response.data;
  }

  // AI endpoints
  async categorizeTransaction(
    params: CategorizeTransactionParams
  ): Promise<any> {
    const response = await this.client.post("/api/v1/ai/categorize", null, {
      params,
    });
    return response.data;
  }

  async analyzeSpendingPatterns(): Promise<any> {
    const response = await this.client.post("/api/v1/ai/analyze-spending");
    return response.data;
  }

  async detectTransactionAnomalies(
    params: DetectAnomaliesParams
  ): Promise<any> {
    const response = await this.client.post(
      "/api/v1/ai/detect-anomalies",
      null,
      {
        params,
      }
    );
    return response.data;
  }

  // Keywords endpoints
  async getKeywordsByCategory(
    categoryId: string
  ): Promise<CategoryKeywordResponse[]> {
    const response = await this.client.get<CategoryKeywordResponse[]>(
      `/api/v1/keywords/by-category/${categoryId}`
    );
    return response.data;
  }

  async createKeyword(
    data: CategoryKeywordCreate
  ): Promise<CategoryKeywordResponse> {
    const response = await this.client.post<CategoryKeywordResponse>(
      "/api/v1/keywords/",
      data
    );
    return response.data;
  }

  async createKeywordsBulk(
    data: CategoryKeywordsBulkCreate
  ): Promise<CategoryKeywordResponse[]> {
    const response = await this.client.post<CategoryKeywordResponse[]>(
      "/api/v1/keywords/bulk",
      data
    );
    return response.data;
  }

  async updateKeyword(
    keywordId: string,
    data: CategoryKeywordUpdate
  ): Promise<CategoryKeywordResponse> {
    const response = await this.client.put<CategoryKeywordResponse>(
      `/api/v1/keywords/${keywordId}`,
      data
    );
    return response.data;
  }

  async deleteKeyword(keywordId: string): Promise<void> {
    await this.client.delete(`/api/v1/keywords/${keywordId}`);
  }

  async seedDefaultKeywords(): Promise<CategoryKeywordResponse[]> {
    const response = await this.client.post<CategoryKeywordResponse[]>(
      "/api/v1/keywords/seed-defaults"
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get("/health");
    return response.data;
  }

  // Network Providers
  async getNetworkProviders(countryCode?: string, activeOnly: boolean = true): Promise<NetworkProvider[]> {
    const params = new URLSearchParams();
    if (countryCode) params.append('country_code', countryCode);
    if (activeOnly !== undefined) params.append('active_only', activeOnly.toString());
    
    const response = await this.client.get<NetworkProvider[]>(`/api/v1/network-providers/?${params}`);
    return response.data;
  }

  async createNetworkProvider(data: NetworkProviderCreate): Promise<NetworkProvider> {
    const response = await this.client.post<NetworkProvider>("/api/v1/network-providers/", data);
    return response.data;
  }

  async getNetworkProvider(networkProviderId: string): Promise<NetworkProvider> {
    const response = await this.client.get<NetworkProvider>(`/api/v1/network-providers/${networkProviderId}`);
    return response.data;
  }

  async updateNetworkProvider(networkProviderId: string, data: NetworkProviderUpdate): Promise<NetworkProvider> {
    const response = await this.client.put<NetworkProvider>(`/api/v1/network-providers/${networkProviderId}`, data);
    return response.data;
  }

  // Card Types
  async getCardTypes(countryCode?: string, activeOnly: boolean = true): Promise<CardType[]> {
    const params = new URLSearchParams();
    if (countryCode) params.append('country_code', countryCode);
    if (activeOnly !== undefined) params.append('active_only', activeOnly.toString());
    
    const response = await this.client.get<CardType[]>(`/api/v1/card-types/?${params}`);
    return response.data;
  }

  async createCardType(data: CardTypeCreate): Promise<CardType> {
    const response = await this.client.post<CardType>("/api/v1/card-types/", data);
    return response.data;
  }

  async getCardType(cardTypeId: string): Promise<CardType> {
    const response = await this.client.get<CardType>(`/api/v1/card-types/${cardTypeId}`);
    return response.data;
  }

  async updateCardType(cardTypeId: string, data: CardTypeUpdate): Promise<CardType> {
    const response = await this.client.put<CardType>(`/api/v1/card-types/${cardTypeId}`, data);
    return response.data;
  }

}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;

import axios, { AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  Token,
  User,
  UserCreate,
  UserLogin,
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
  RetryRequest,
  AnalyticsResponse,
  CategorySpending,
  SpendingTrend,
  YearComparison,
  AIInsight,
  AnalyticsFilters,
  TrendsFilters,
  CategorizeTransactionParams,
  DetectAnomaliesParams,
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
          // Only redirect if we're not already on the login page to avoid reload loops
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
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

  // Note: Backend doesn't have a /me endpoint yet
  // async getCurrentUser(): Promise<User> {
  //   const response = await this.client.get<User>('/api/v1/auth/me');
  //   return response.data;
  // }

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

  async getStatements(): Promise<Statement[]> {
    const response = await this.client.get<Statement[]>("/api/v1/statements/");
    return response.data;
  }

  async processStatement(
    statementId: string,
    cardId?: string,
    cardName?: string
  ): Promise<StatementProcess> {
    const requestBody = {
      card_id: cardId || null,
      card_name: cardName || null,
      statement_month: null,
    };

    const response = await this.client.post<StatementProcess>(
      `/api/v1/statements/${statementId}/process`,
      requestBody
    );
    return response.data;
  }

  // New multi-step statement processing endpoints
  async getStatementStatus(statementId: string): Promise<StatementStatusResponse> {
    const response = await this.client.get<StatementStatusResponse>(
      `/api/v1/statements/${statementId}/status`
    );
    return response.data;
  }

  async extractTransactions(
    statementId: string,
    request: ExtractionRequest
  ): Promise<ExtractionResponse> {
    const response = await this.client.post<ExtractionResponse>(
      `/api/v1/statements/${statementId}/extract`,
      request
    );
    return response.data;
  }

  async categorizeTransactions(
    statementId: string,
    request: CategorizationRequest
  ): Promise<CategorizationResponse> {
    const response = await this.client.post<CategorizationResponse>(
      `/api/v1/statements/${statementId}/categorize`,
      request
    );
    return response.data;
  }

  async retryProcessingStep(
    statementId: string,
    request: RetryRequest
  ): Promise<any> {
    const response = await this.client.post(
      `/api/v1/statements/${statementId}/retry`,
      request
    );
    return response.data;
  }

  async getStatementInsights(statementId: string): Promise<any> {
    const response = await this.client.get(
      `/api/v1/statements/${statementId}/insights`
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

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get("/health");
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;

// API Types based on the backend OpenAPI specification

export interface User {
  email: string;
  id: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Card {
  card_name: string;
  payment_due_date?: string | null;
  network_provider?: string | null;
  bank_provider?: string | null;
  card_type?: string | null;
  id: string;
  user_id: string;
  created_at: string;
}

export interface CardCreate {
  card_name: string;
  payment_due_date?: string | null;
  network_provider?: string | null;
  bank_provider?: string | null;
  card_type?: string | null;
}

export interface CardUpdate {
  card_name?: string | null;
  payment_due_date?: string | null;
  network_provider?: string | null;
  bank_provider?: string | null;
  card_type?: string | null;
}

export interface Transaction {
  merchant: string;
  amount: string;
  category?: string | null;
  transaction_date: string;
  tags?: string[] | null;
  description?: string | null;
  id: string;
  card_id: string;
  ai_confidence?: string | null;
  created_at: string;
}

export interface TransactionCreate {
  merchant: string;
  amount: number | string;
  category?: string | null;
  transaction_date: string;
  tags?: string[] | null;
  description?: string | null;
  card_id: string;
}

export interface TransactionUpdate {
  merchant?: string | null;
  amount?: number | string | null;
  category?: string | null;
  transaction_date?: string | null;
  tags?: string[] | null;
  description?: string | null;
}

export interface Budget {
  category: string;
  limit_amount: string;
  month: string;
  id: string;
  user_id: string;
  created_at: string;
}

export interface BudgetCreate {
  category: string;
  limit_amount: number | string;
  month: string;
}

export interface BudgetUpdate {
  category?: string | null;
  limit_amount?: number | string | null;
  month?: string | null;
}

export interface BudgetAlert {
  budget: Budget;
  current_spending: string;
  percentage_used: number;
  alert_type: string;
}

export interface RecurringService {
  name: string;
  amount: string;
  due_date: string;
  category?: string | null;
  reminder_days?: number | null;
  id: string;
  user_id: string;
  created_at: string;
}

export interface RecurringServiceCreate {
  name: string;
  amount: number | string;
  due_date: string;
  category?: string | null;
  reminder_days?: number | null;
}

export interface RecurringServiceUpdate {
  name?: string | null;
  amount?: number | string | null;
  due_date?: string | null;
  category?: string | null;
  reminder_days?: number | null;
}

export interface Statement {
  filename: string;
  file_type: string;
  id: string;
  user_id: string;
  file_path: string;
  status: string;
  is_processed: boolean;
  created_at: string;
}

export interface StatementProcess {
  statement_id: string;
  transactions_found: number;
  transactions_created: number;
}

export interface CategorySpending {
  category: string;
  amount: string;
  transaction_count: number;
}

export interface SpendingTrend {
  month: string;
  amount: string;
}

export interface YearComparison {
  current_year: number;
  previous_year: number;
  current_amount: string;
  previous_amount: string;
  percentage_change: number;
}

export interface AIInsight {
  type: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
}

export interface AnalyticsResponse {
  category_spending: CategorySpending[];
  trends: SpendingTrend[];
  year_comparison: YearComparison;
  insights: AIInsight[];
}

// Query Parameters
export interface TransactionFilters {
  skip?: number;
  limit?: number;
  card_id?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
}

export interface TrendsFilters {
  months?: number;
}

// AI API interfaces
export interface CategorizeTransactionParams {
  merchant: string;
  amount: number;
  description?: string;
}

export interface DetectAnomaliesParams {
  merchant: string;
  amount: number;
  category: string;
  description?: string;
}

// Error types
export interface APIError {
  detail: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
  }>;
}

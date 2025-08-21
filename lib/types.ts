// API Types based on the backend OpenAPI specification

// Reusable alias for numeric-or-string inputs used across forms
export type NumStr = number | string;

export interface User {
  email: string;
  id: string;
  first_name?: string;
  last_name?: string;
  // Optional display name decoded from JWT or composed in UI
  name?: string;
  phone_number?: string;
  profile_picture_url?: string;
  preferred_currency: string;
  timezone: string;
  is_active: boolean;
  // Admin flag (RBAC)
  is_admin: boolean;
  // User plan tier
  plan_tier: "free" | "plus" | "pro" | "admin";
  created_at: string;
  updated_at?: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  preferred_currency?: string;
  timezone?: string;
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

export interface PlanChangeRequest {
  target_plan: "free" | "plus" | "pro" | "admin";
}

export interface PlanChangeResponse {
  success: boolean;
  message: string;
  checkout_url?: string;
  current_plan: "free" | "plus" | "pro" | "admin";
}

export interface Category {
  id: string;
  name: string;
  color?: string | null;
  keywords?: string[] | null;
  is_active: boolean;
  is_default?: boolean;
  can_modify?: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface CategoryCreate {
  name: string;
  color?: string | null;
  keywords?: string[] | null;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string | null;
  color?: string | null;
  keywords?: string[] | null;
  is_active?: boolean | null;
}

export interface Card {
  id: string;
  user_id: string;
  card_name: string;
  payment_due_date?: string | null;
  bank_provider_id?: string | null; // Reference to BankProvider
  // Full related entity details from API
  bank_provider?: BankProviderSimple | null;
  // Optional metadata
  card_type?: string | null;
  network_provider?: string | null;
  created_at: string;
}

export interface CardCreate {
  card_name: string;
  payment_due_date?: string | null;
  bank_provider_id?: string | null;
}

export interface CardUpdate {
  card_name?: string | null;
  payment_due_date?: string | null;
  bank_provider_id?: string | null;
  card_type?: string | null;
  network_provider?: string | null;
}

export interface Transaction {
  merchant: string;
  amount: string;
  currency: string;
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
  amount: NumStr;
  currency?: string;
  category?: string | null;
  transaction_date: string;
  tags?: string[] | null;
  description?: string | null;
  card_id: string;
}

export interface TransactionUpdate {
  merchant?: string | null;
  amount?: NumStr | null;
  category?: string | null;
  transaction_date?: string | null;
  tags?: string[] | null;
  description?: string | null;
}

export interface Budget {
  category: string;
  limit_amount: string;
  currency: string;
  month: string;
  id: string;
  user_id: string;
  created_at: string;
}

export interface BudgetCreate {
  category: string;
  limit_amount: NumStr;
  currency: string;
  month: string;
}

export interface BudgetUpdate {
  category?: string | null;
  limit_amount?: NumStr | null;
  currency?: string | null;
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
  amount: NumStr;
  due_date: string;
  category?: string | null;
  reminder_days?: number | null;
}

export interface RecurringServiceUpdate {
  name?: string | null;
  amount?: NumStr | null;
  due_date?: string | null;
  category?: string | null;
  reminder_days?: number | null;
}

export interface Statement {
  filename: string;
  file_type: string;
  id: string;
  user_id: string;
  // Related card (optional)
  card_id?: string | null;
  file_path: string;
  statement_month?: string | null;
  status: string;
  extraction_status: string;
  categorization_status: string;
  retry_count: string;
  error_message?: string | null;
  is_processed: boolean;
  ai_insights?: string | null;
  created_at: string;
}

export interface StatementProcess {
  statement_id: string;
  transactions_found: number;
  transactions_created: number;
  alerts_created?: number | null;
  ai_insights?: Record<string, any> | null;
}

// New interfaces for the multi-step process
export interface StatementStatusResponse {
  statement_id: string;
  status: string;
  extraction_status: string;
  categorization_status: string;
  retry_count: Record<string, number>;
  error_message?: string | null;
  progress_percentage: number;
  current_step: string;
  estimated_completion?: string | null;
}

export interface ExtractionRequest {
  card_id?: string | null;
  card_name?: string | null;
  statement_month?: string | null; // Format: YYYY-MM-DD, YYYY-MM, or month name
}

export interface ExtractionResponse {
  statement_id: string;
  transactions_found: number;
  status: string;
  message: string;
}

export interface CategorizationRequest {
  use_ai?: boolean;
  use_keywords?: boolean;
}

export interface CategorizationResponse {
  statement_id: string;
  transactions_categorized: number;
  ai_categorized: number;
  keyword_categorized: number;
  uncategorized: number;
  status: string;
  message: string;
}

export interface RetryRequest {
  step: string;
}

export interface CategorySpending {
  category: string;
  amount: string;
  transaction_count: number;
  currency: string;
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
  currency?: string;
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

// Keyword types
export interface CategoryKeyword {
  id: string;
  user_id: string;
  category_id: string;
  keyword: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryKeywordCreate {
  category_id: string;
  keyword: string;
  description?: string | null;
}

export interface CategoryKeywordUpdate {
  keyword?: string | null;
  description?: string | null;
}

export interface CategoryKeywordsBulkCreate {
  category_id: string;
  keywords: string[];
}

export interface CategoryKeywordResponse {
  id: string;
  category_id: string;
  keyword: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Bank Provider Types - for the master list of banks
export interface BankProvider {
  id: string;
  name: string;
  short_name?: string | null;
  country: string;
  country_name: string;
  logo_url?: string | null;
  website?: string | null;
  color_primary?: string | null;
  color_secondary?: string | null;
  is_active: boolean;
  is_popular: boolean;
  created_at: string;
}

// Simplified version for dropdowns and displays
export interface BankProviderSimple {
  id: string;
  name: string;
  short_name?: string | null;
  country: string;
  is_popular: boolean; // Added for sorting popular banks first
  color_primary?: string | null; // Added for card theming
  color_secondary?: string | null; // Added for card theming
  display_name?: string; // Computed property
}

export interface ExcludedKeywordItem {
  id: string;
  keyword: string;
  created_at?: string;
}

export interface ExcludedKeywordListResponse {
  items: ExcludedKeywordItem[];
}

// Admin types
export interface AdminUsersParams {
  q?: string;
  limit?: number; // default 25
  offset?: number;
  sort?: string; // default created_at
  order?: "asc" | "desc"; // default desc
}

export interface ToggleUserActiveResponse {
  id: string;
  is_active: boolean;
}

export interface SignupStatsPoint {
  day: string; // ISO date YYYY-MM-DD
  count: number;
}

export interface SignupStatsResponse {
  start: string;
  end: string;
  tz: string;
  data: SignupStatsPoint[];
}

export interface OTPVerifyRequest {
  email: string;
  code: string;
}

export interface OTPResendRequest {
  email: string;
}

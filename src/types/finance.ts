import { CountryCode, CurrencyCode } from '../utils/countries';

export type Theme = 'light' | 'dark';

export type AccountType = 
  | 'savings'
  | 'checking'
  | 'cash'
  | 'digital'
  | 'joint_account'
  | 'dollar_account';

export type TransactionType = 'income' | 'expense' | 'debt' | 'investment';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'other';

export type LoanType = 'personal' | 'mortgage' | 'auto' | 'student' | 'business' | 'other';

export type LoanStatus = 'active' | 'paid_off' | 'defaulted' | 'in_grace_period' | 'paid';

export type InvestmentCategory = 
  | 'stocks' 
  | 'bonds' 
  | 'mutual_funds' 
  | 'etfs' 
  | 'crypto' 
  | 'real_estate' 
  | 'traditional' 
  | 'alternative'
  | 'digital'
  | 'business'
  | 'retirement'
  | 'other';

export type InvestmentType = 'stocks' | 'bonds' | 'mutual_funds' | 'etfs' | 'crypto' | 'real_estate' | 'other';

export type InvestmentStatus = 'active' | 'sold' | 'pending';

export type InvestmentRiskLevel = 
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high';

export type RecurringFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

export interface BaseModel {
  id: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends BaseModel {
  name: string;
  email: string;
  photoUrl?: string;
  country: CountryCode;
  currency: CurrencyCode;
  theme: Theme;
  notificationsEnabled: boolean;
}

export interface Transaction extends BaseModel {
  type: TransactionType;
  amount: number;
  date: string;
  time: string;  // Added time field
  category: string;
  details: string;
  from?: string;
  to?: string;
  paymentMethod?: PaymentMethod;
  creditCardId?: string;
  fundSourceId?: string;
  loanId?: string;
  debtId?: string;
  recurringTransactionId?: string;
  lastProcessed?: string;
}

export interface CreditCard extends BaseModel {
  name: string;
  bank: string;
  limit: number;
  balance: number;
  apr: number;
  dueDate: string;
  cutOffDate: string;
  minimumPayment: number;
  transactions: Transaction[];
}

export interface FundSource extends BaseModel {
  bankName: string;
  accountName: string;
  accountType: string; // Can be custom or from AccountType
  currentBalance: number;
  monthlyFlow?: number;
  lastUpdated?: string;
  transactions: Transaction[];
}

export interface Loan extends BaseModel {
  name: string;
  lender: string;
  type: LoanType;
  amount: number;
  originalAmount: number;
  balance: number;
  currentBalance: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  paymentAmount: number;
  monthlyPayment: number;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  status: LoanStatus;
  nextPaymentDate: string;
  fundSourceId?: string;
  transactions: Transaction[];
}

export interface Debt extends BaseModel {
  name: string;
  amount: number;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  type: 'credit_card' | 'personal_loan' | 'student_loan' | 'mortgage' | 'other';
  transactions: Transaction[];
}

export interface Investment extends BaseModel {
  name: string;
  type: InvestmentType;
  category: InvestmentCategory;
  amount: number;
  currentValue: number;
  purchaseDate: string;
  purchasePrice: number;
  quantity: number;
  platform: string;
  riskLevel: InvestmentRiskLevel;
  status: InvestmentStatus;
  expectedReturn: number;
  maturityDate?: string;
  notes?: string;
  fundSourceId?: string;
  lastUpdated?: string;
  transactions: Transaction[];
}

export interface Budget extends BaseModel {
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

export interface RecurringTransaction extends BaseModel {
  type: TransactionType;
  amount: number;
  category: string;
  details: string;
  from?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  fundSourceId?: string;
  creditCardId?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
}

export interface Report {
  id: string;
  type: 'income' | 'expense' | 'savings' | 'investment' | 'debt';
  startDate: string;
  endDate: string;
  data: any; // This will be specific to the report type
}

export interface FinancialGoal extends BaseModel {
  name: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'custom';
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'in_progress' | 'completed' | 'failed';
}

// Helper function to convert Date to string
export const dateToString = (date: Date): string => {
  return date.toISOString();
};

// Helper function to convert string to Date
export const stringToDate = (dateString: string): Date => {
  return new Date(dateString);
};

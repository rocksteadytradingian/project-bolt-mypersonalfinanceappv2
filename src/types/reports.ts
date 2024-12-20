import { Transaction, Budget, FundSource, CreditCard, Debt, Loan } from './finance';

export type ReportType = 'fund-sources' | 'credit-cards' | 'debts' | 'budget' | 'recurring' | 'transactions';

export interface ReportData {
  type: ReportType;
  data: any[];
  summary?: Record<string, number>;
}
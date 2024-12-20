import { Transaction, Budget, Debt, CreditCard, Loan } from '../../types/finance';

export interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  debts: Debt[];
  creditCards: CreditCard[];
  loans: Loan[];
  currency: string;
}

export interface AIProvider {
  id: string;
  name: string;
  generateResponse: (prompt: string, financialData: FinancialData) => Promise<string>;
}

export interface AIMessage {
  text: string;
  isUser: boolean;
  provider?: string;
}
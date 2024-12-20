import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  UserProfile, 
  Transaction, 
  CreditCard, 
  FundSource, 
  Loan, 
  Debt, 
  Investment,
  Budget,
  RecurringTransaction,
  Category
} from '../types/finance';

interface FinancialData {
  transactions: Transaction[];
  creditCards: CreditCard[];
  fundSources: FundSource[];
  loans: Loan[];
  debts: Debt[];
  investments: Investment[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
}

interface FinanceStore extends FinancialData {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setFinancialData: (data: FinancialData) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (card: CreditCard) => void;
  deleteCreditCard: (cardId: string) => void;
  addFundSource: (source: Omit<FundSource, 'id'>) => void;
  updateFundSource: (source: FundSource) => void;
  deleteFundSource: (sourceId: string) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (loanId: string) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (debtId: string) => void;
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (investment: Investment) => void;
  deleteInvestment: (investmentId: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (transaction: RecurringTransaction) => void;
  deleteRecurringTransaction: (transactionId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Salary', type: 'income', color: '#4CAF50', icon: '💰' },
  { id: '2', name: 'Bonus', type: 'income', color: '#8BC34A', icon: '🎁' },
  { id: '3', name: 'Investment', type: 'income', color: '#009688', icon: '📈' },
  { id: '4', name: 'Food', type: 'expense', color: '#F44336', icon: '🍔' },
  { id: '5', name: 'Transportation', type: 'expense', color: '#FF5722', icon: '🚗' },
  { id: '6', name: 'Shopping', type: 'expense', color: '#E91E63', icon: '🛍️' },
  { id: '7', name: 'Bills', type: 'expense', color: '#9C27B0', icon: '📄' },
  { id: '8', name: 'Entertainment', type: 'expense', color: '#673AB7', icon: '🎮' },
  { id: '9', name: 'Credit Card', type: 'debt', color: '#3F51B5', icon: '💳' },
  { id: '10', name: 'Loan', type: 'debt', color: '#2196F3', icon: '🏦' }
];

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      userProfile: null,
      transactions: [],
      creditCards: [],
      fundSources: [],
      loans: [],
      debts: [],
      investments: [],
      budgets: [],
      recurringTransactions: [],
      categories: defaultCategories,

      setUserProfile: (profile) => set({ userProfile: profile }),
      updateUserProfile: (updates) => set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, ...updates } : null
      })),

      // New method for batch updates
      setFinancialData: (data) => set(data),

      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { ...transaction, id: uuidv4() }]
      })),
      updateTransaction: (transaction) => set((state) => ({
        transactions: state.transactions.map((t) => 
          t.id === transaction.id ? transaction : t
        )
      })),
      deleteTransaction: (transactionId) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== transactionId)
      })),

      addCreditCard: (card) => set((state) => ({
        creditCards: [...state.creditCards, { ...card, id: uuidv4() }]
      })),
      updateCreditCard: (card) => set((state) => ({
        creditCards: state.creditCards.map((c) => 
          c.id === card.id ? card : c
        )
      })),
      deleteCreditCard: (cardId) => set((state) => ({
        creditCards: state.creditCards.filter((c) => c.id !== cardId)
      })),

      addFundSource: (source) => set((state) => ({
        fundSources: [...state.fundSources, { ...source, id: uuidv4() }]
      })),
      updateFundSource: (source) => set((state) => ({
        fundSources: state.fundSources.map((s) => 
          s.id === source.id ? source : s
        )
      })),
      deleteFundSource: (sourceId) => set((state) => ({
        fundSources: state.fundSources.filter((s) => s.id !== sourceId)
      })),

      addLoan: (loan) => set((state) => ({
        loans: [...state.loans, { ...loan, id: uuidv4() }]
      })),
      updateLoan: (loan) => set((state) => ({
        loans: state.loans.map((l) => 
          l.id === loan.id ? loan : l
        )
      })),
      deleteLoan: (loanId) => set((state) => ({
        loans: state.loans.filter((l) => l.id !== loanId)
      })),

      addDebt: (debt) => set((state) => ({
        debts: [...state.debts, { ...debt, id: uuidv4() }]
      })),
      updateDebt: (debt) => set((state) => ({
        debts: state.debts.map((d) => 
          d.id === debt.id ? debt : d
        )
      })),
      deleteDebt: (debtId) => set((state) => ({
        debts: state.debts.filter((d) => d.id !== debtId)
      })),

      addInvestment: (investment) => set((state) => ({
        investments: [...state.investments, { ...investment, id: uuidv4() }]
      })),
      updateInvestment: (investment) => set((state) => ({
        investments: state.investments.map((i) => 
          i.id === investment.id ? investment : i
        )
      })),
      deleteInvestment: (investmentId) => set((state) => ({
        investments: state.investments.filter((i) => i.id !== investmentId)
      })),

      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets, { ...budget, id: uuidv4() }]
      })),
      updateBudget: (budget) => set((state) => ({
        budgets: state.budgets.map((b) => 
          b.id === budget.id ? budget : b
        )
      })),
      deleteBudget: (budgetId) => set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== budgetId)
      })),

      addRecurringTransaction: (transaction) => set((state) => ({
        recurringTransactions: [...state.recurringTransactions, { ...transaction, id: uuidv4() }]
      })),
      updateRecurringTransaction: (transaction) => set((state) => ({
        recurringTransactions: state.recurringTransactions.map((t) => 
          t.id === transaction.id ? transaction : t
        )
      })),
      deleteRecurringTransaction: (transactionId) => set((state) => ({
        recurringTransactions: state.recurringTransactions.filter((t) => t.id !== transactionId)
      })),

      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: uuidv4() }]
      })),
      updateCategory: (category) => set((state) => ({
        categories: state.categories.map((c) => 
          c.id === category.id ? category : c
        )
      })),
      deleteCategory: (categoryId) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== categoryId)
      }))
    }),
    {
      name: 'finance-store',
      partialize: (state) => ({
        userProfile: state.userProfile,
        transactions: state.transactions,
        creditCards: state.creditCards,
        fundSources: state.fundSources,
        loans: state.loans,
        debts: state.debts,
        investments: state.investments,
        budgets: state.budgets,
        recurringTransactions: state.recurringTransactions,
        categories: state.categories
      })
    }
  )
);

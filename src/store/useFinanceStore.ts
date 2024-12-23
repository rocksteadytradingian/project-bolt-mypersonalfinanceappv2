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
import { updateUserFinancialData } from '../services/firebase/financeService';

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

// Helper function to sync with Firebase
const syncWithFirebase = async (userId: string | undefined, collection: keyof FinancialData, data: any) => {
  if (userId) {
    try {
      await updateUserFinancialData(userId, collection, data);
    } catch (error) {
      console.error(`Error syncing ${collection} with Firebase:`, error);
    }
  }
};

export const useFinanceStore = create<FinanceStore>()((set, get) => ({
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

      setFinancialData: (data) => set(data),

      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: uuidv4() };
        set((state) => {
          const newTransactions = [...state.transactions, newTransaction];
          syncWithFirebase(state.userProfile?.id, 'transactions', newTransactions);
          return { transactions: newTransactions };
        });
      },
      updateTransaction: (transaction) => set((state) => {
        const newTransactions = state.transactions.map((t) => 
          t.id === transaction.id ? transaction : t
        );
        syncWithFirebase(state.userProfile?.id, 'transactions', newTransactions);
        return { transactions: newTransactions };
      }),
      deleteTransaction: (transactionId) => set((state) => {
        const newTransactions = state.transactions.filter((t) => t.id !== transactionId);
        syncWithFirebase(state.userProfile?.id, 'transactions', newTransactions);
        return { transactions: newTransactions };
      }),

      addFundSource: (source) => {
        const newSource = { ...source, id: uuidv4() };
        set((state) => {
          const newFundSources = [...state.fundSources, newSource];
          syncWithFirebase(state.userProfile?.id, 'fundSources', newFundSources);
          return { fundSources: newFundSources };
        });
      },
      updateFundSource: (source) => set((state) => {
        const newFundSources = state.fundSources.map((s) => 
          s.id === source.id ? source : s
        );
        syncWithFirebase(state.userProfile?.id, 'fundSources', newFundSources);
        return { fundSources: newFundSources };
      }),
      deleteFundSource: (sourceId) => set((state) => {
        const newFundSources = state.fundSources.filter((s) => s.id !== sourceId);
        syncWithFirebase(state.userProfile?.id, 'fundSources', newFundSources);
        return { fundSources: newFundSources };
      }),

      // Other methods with similar Firebase sync pattern
      addCreditCard: (card) => {
        const newCard = { ...card, id: uuidv4() };
        set((state) => {
          const newCreditCards = [...state.creditCards, newCard];
          syncWithFirebase(state.userProfile?.id, 'creditCards', newCreditCards);
          return { creditCards: newCreditCards };
        });
      },
      updateCreditCard: (card) => set((state) => {
        const newCreditCards = state.creditCards.map((c) => 
          c.id === card.id ? card : c
        );
        syncWithFirebase(state.userProfile?.id, 'creditCards', newCreditCards);
        return { creditCards: newCreditCards };
      }),
      deleteCreditCard: (cardId) => set((state) => {
        const newCreditCards = state.creditCards.filter((c) => c.id !== cardId);
        syncWithFirebase(state.userProfile?.id, 'creditCards', newCreditCards);
        return { creditCards: newCreditCards };
      }),

      addLoan: (loan) => {
        const newLoan = { ...loan, id: uuidv4() };
        set((state) => {
          const newLoans = [...state.loans, newLoan];
          syncWithFirebase(state.userProfile?.id, 'loans', newLoans);
          return { loans: newLoans };
        });
      },
      updateLoan: (loan) => set((state) => {
        const newLoans = state.loans.map((l) => 
          l.id === loan.id ? loan : l
        );
        syncWithFirebase(state.userProfile?.id, 'loans', newLoans);
        return { loans: newLoans };
      }),
      deleteLoan: (loanId) => set((state) => {
        const newLoans = state.loans.filter((l) => l.id !== loanId);
        syncWithFirebase(state.userProfile?.id, 'loans', newLoans);
        return { loans: newLoans };
      }),

      addDebt: (debt) => {
        const newDebt = { ...debt, id: uuidv4() };
        set((state) => {
          const newDebts = [...state.debts, newDebt];
          syncWithFirebase(state.userProfile?.id, 'debts', newDebts);
          return { debts: newDebts };
        });
      },
      updateDebt: (debt) => set((state) => {
        const newDebts = state.debts.map((d) => 
          d.id === debt.id ? debt : d
        );
        syncWithFirebase(state.userProfile?.id, 'debts', newDebts);
        return { debts: newDebts };
      }),
      deleteDebt: (debtId) => set((state) => {
        const newDebts = state.debts.filter((d) => d.id !== debtId);
        syncWithFirebase(state.userProfile?.id, 'debts', newDebts);
        return { debts: newDebts };
      }),

      addInvestment: (investment) => {
        const newInvestment = { ...investment, id: uuidv4() };
        set((state) => {
          const newInvestments = [...state.investments, newInvestment];
          syncWithFirebase(state.userProfile?.id, 'investments', newInvestments);
          return { investments: newInvestments };
        });
      },
      updateInvestment: (investment) => set((state) => {
        const newInvestments = state.investments.map((i) => 
          i.id === investment.id ? investment : i
        );
        syncWithFirebase(state.userProfile?.id, 'investments', newInvestments);
        return { investments: newInvestments };
      }),
      deleteInvestment: (investmentId) => set((state) => {
        const newInvestments = state.investments.filter((i) => i.id !== investmentId);
        syncWithFirebase(state.userProfile?.id, 'investments', newInvestments);
        return { investments: newInvestments };
      }),

      addBudget: (budget) => {
        const newBudget = { ...budget, id: uuidv4() };
        set((state) => {
          const newBudgets = [...state.budgets, newBudget];
          syncWithFirebase(state.userProfile?.id, 'budgets', newBudgets);
          return { budgets: newBudgets };
        });
      },
      updateBudget: (budget) => set((state) => {
        const newBudgets = state.budgets.map((b) => 
          b.id === budget.id ? budget : b
        );
        syncWithFirebase(state.userProfile?.id, 'budgets', newBudgets);
        return { budgets: newBudgets };
      }),
      deleteBudget: (budgetId) => set((state) => {
        const newBudgets = state.budgets.filter((b) => b.id !== budgetId);
        syncWithFirebase(state.userProfile?.id, 'budgets', newBudgets);
        return { budgets: newBudgets };
      }),

      addRecurringTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: uuidv4() };
        set((state) => {
          const newRecurringTransactions = [...state.recurringTransactions, newTransaction];
          syncWithFirebase(state.userProfile?.id, 'recurringTransactions', newRecurringTransactions);
          return { recurringTransactions: newRecurringTransactions };
        });
      },
      updateRecurringTransaction: (transaction) => set((state) => {
        const newRecurringTransactions = state.recurringTransactions.map((t) => 
          t.id === transaction.id ? transaction : t
        );
        syncWithFirebase(state.userProfile?.id, 'recurringTransactions', newRecurringTransactions);
        return { recurringTransactions: newRecurringTransactions };
      }),
      deleteRecurringTransaction: (transactionId) => set((state) => {
        const newRecurringTransactions = state.recurringTransactions.filter((t) => t.id !== transactionId);
        syncWithFirebase(state.userProfile?.id, 'recurringTransactions', newRecurringTransactions);
        return { recurringTransactions: newRecurringTransactions };
      }),

      addCategory: (category) => {
        const newCategory = { ...category, id: uuidv4() };
        set((state) => {
          const newCategories = [...state.categories, newCategory];
          syncWithFirebase(state.userProfile?.id, 'categories', newCategories);
          return { categories: newCategories };
        });
      },
      updateCategory: (category) => set((state) => {
        const newCategories = state.categories.map((c) => 
          c.id === category.id ? category : c
        );
        syncWithFirebase(state.userProfile?.id, 'categories', newCategories);
        return { categories: newCategories };
      }),
      deleteCategory: (categoryId) => set((state) => {
        const newCategories = state.categories.filter((c) => c.id !== categoryId);
        syncWithFirebase(state.userProfile?.id, 'categories', newCategories);
        return { categories: newCategories };
      })
}));

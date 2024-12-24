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
const syncWithFirebase = async (userId: string | undefined, state: FinanceStore) => {
  if (userId) {
    try {
      const financialData: FinancialData = {
        transactions: state.transactions,
        creditCards: state.creditCards,
        fundSources: state.fundSources,
        loans: state.loans,
        debts: state.debts,
        investments: state.investments,
        budgets: state.budgets,
        recurringTransactions: state.recurringTransactions,
        categories: state.categories
      };
      await updateUserFinancialData(userId, 'transactions', financialData.transactions);
      await updateUserFinancialData(userId, 'fundSources', financialData.fundSources);
      await updateUserFinancialData(userId, 'creditCards', financialData.creditCards);
      await updateUserFinancialData(userId, 'loans', financialData.loans);
      await updateUserFinancialData(userId, 'debts', financialData.debts);
      await updateUserFinancialData(userId, 'investments', financialData.investments);
      await updateUserFinancialData(userId, 'budgets', financialData.budgets);
      await updateUserFinancialData(userId, 'recurringTransactions', financialData.recurringTransactions);
      await updateUserFinancialData(userId, 'categories', financialData.categories);
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
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
          const newState = {
            ...state,
            transactions: [...state.transactions, newTransaction]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateTransaction: (transaction) => set((state) => {
        const newState = {
          ...state,
          transactions: state.transactions.map((t) => 
            t.id === transaction.id ? transaction : t
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteTransaction: (transactionId) => set((state) => {
        const newState = {
          ...state,
          transactions: state.transactions.filter((t) => t.id !== transactionId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addFundSource: (source) => {
        const newSource = { ...source, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            fundSources: [...state.fundSources, newSource]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateFundSource: (source) => set((state) => {
        const newState = {
          ...state,
          fundSources: state.fundSources.map((s) => 
            s.id === source.id ? source : s
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteFundSource: (sourceId) => set((state) => {
        const newState = {
          ...state,
          fundSources: state.fundSources.filter((s) => s.id !== sourceId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addCreditCard: (card) => {
        const newCard = { ...card, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            creditCards: [...state.creditCards, newCard]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateCreditCard: (card) => set((state) => {
        const newState = {
          ...state,
          creditCards: state.creditCards.map((c) => 
            c.id === card.id ? card : c
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteCreditCard: (cardId) => set((state) => {
        const newState = {
          ...state,
          creditCards: state.creditCards.filter((c) => c.id !== cardId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addLoan: (loan) => {
        const newLoan = { ...loan, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            loans: [...state.loans, newLoan]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateLoan: (loan) => set((state) => {
        const newState = {
          ...state,
          loans: state.loans.map((l) => 
            l.id === loan.id ? loan : l
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteLoan: (loanId) => set((state) => {
        const newState = {
          ...state,
          loans: state.loans.filter((l) => l.id !== loanId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addDebt: (debt) => {
        const newDebt = { ...debt, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            debts: [...state.debts, newDebt]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateDebt: (debt) => set((state) => {
        const newState = {
          ...state,
          debts: state.debts.map((d) => 
            d.id === debt.id ? debt : d
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteDebt: (debtId) => set((state) => {
        const newState = {
          ...state,
          debts: state.debts.filter((d) => d.id !== debtId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addInvestment: (investment) => {
        const newInvestment = { ...investment, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            investments: [...state.investments, newInvestment]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateInvestment: (investment) => set((state) => {
        const newState = {
          ...state,
          investments: state.investments.map((i) => 
            i.id === investment.id ? investment : i
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteInvestment: (investmentId) => set((state) => {
        const newState = {
          ...state,
          investments: state.investments.filter((i) => i.id !== investmentId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addBudget: (budget) => {
        const newBudget = { ...budget, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            budgets: [...state.budgets, newBudget]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateBudget: (budget) => set((state) => {
        const newState = {
          ...state,
          budgets: state.budgets.map((b) => 
            b.id === budget.id ? budget : b
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteBudget: (budgetId) => set((state) => {
        const newState = {
          ...state,
          budgets: state.budgets.filter((b) => b.id !== budgetId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addRecurringTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            recurringTransactions: [...state.recurringTransactions, newTransaction]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateRecurringTransaction: (transaction) => set((state) => {
        const newState = {
          ...state,
          recurringTransactions: state.recurringTransactions.map((t) => 
            t.id === transaction.id ? transaction : t
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteRecurringTransaction: (transactionId) => set((state) => {
        const newState = {
          ...state,
          recurringTransactions: state.recurringTransactions.filter((t) => t.id !== transactionId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),

      addCategory: (category) => {
        const newCategory = { ...category, id: uuidv4() };
        set((state) => {
          const newState = {
            ...state,
            categories: [...state.categories, newCategory]
          };
          syncWithFirebase(state.userProfile?.id, newState);
          return newState;
        });
      },
      updateCategory: (category) => set((state) => {
        const newState = {
          ...state,
          categories: state.categories.map((c) => 
            c.id === category.id ? category : c
          )
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      }),
      deleteCategory: (categoryId) => set((state) => {
        const newState = {
          ...state,
          categories: state.categories.filter((c) => c.id !== categoryId)
        };
        syncWithFirebase(state.userProfile?.id, newState);
        return newState;
      })
}));

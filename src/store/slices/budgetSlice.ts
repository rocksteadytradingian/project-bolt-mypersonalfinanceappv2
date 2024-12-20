import { Budget } from '../../types/finance';

export interface BudgetSlice {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

export const createBudgetSlice = (set: any): BudgetSlice => ({
  budgets: [],
  addBudget: (budget) => set((state: any) => ({
    budgets: [...state.budgets, { ...budget, id: crypto.randomUUID() }],
  })),
  updateBudget: (id, budget) => set((state: any) => ({
    budgets: state.budgets.map((b: Budget) => (b.id === id ? { ...b, ...budget } : b)),
  })),
  deleteBudget: (id) => set((state: any) => ({
    budgets: state.budgets.filter((b: Budget) => b.id !== id),
  })),
});
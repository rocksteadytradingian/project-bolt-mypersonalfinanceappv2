import { Debt } from '../../types/finance';

export interface DebtSlice {
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
}

export const createDebtSlice = (set: any): DebtSlice => ({
  debts: [],
  addDebt: (debt) => set((state: any) => ({
    debts: [...state.debts, { ...debt, id: crypto.randomUUID() }],
  })),
  updateDebt: (id, debt) => set((state: any) => ({
    debts: state.debts.map((d: Debt) => (d.id === id ? { ...d, ...debt } : d)),
  })),
  deleteDebt: (id) => set((state: any) => ({
    debts: state.debts.filter((d: Debt) => d.id !== id),
  })),
});
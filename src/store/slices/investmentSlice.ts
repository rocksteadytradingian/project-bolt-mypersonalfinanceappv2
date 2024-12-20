import { StateCreator } from 'zustand';
import { Investment } from '../../types/finance';

export interface InvestmentSlice {
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
}

export const createInvestmentSlice: StateCreator<
  InvestmentSlice,
  [],
  [],
  InvestmentSlice
> = (set, get, store) => ({
  investments: [],
  addInvestment: (investment) => set((state) => ({
    investments: [...state.investments, { ...investment, id: crypto.randomUUID() }]
  })),
  updateInvestment: (id, updates) => set((state) => ({
    investments: state.investments.map((inv) =>
      inv.id === id ? { ...inv, ...updates } : inv
    )
  })),
  deleteInvestment: (id) => set((state) => ({
    investments: state.investments.filter((inv) => inv.id !== id)
  }))
});

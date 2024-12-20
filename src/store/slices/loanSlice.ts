import { Loan } from '../../types/finance';

export interface LoanSlice {
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
}

export const createLoanSlice = (set: any): LoanSlice => ({
  loans: [],
  addLoan: (loan) => set((state: any) => ({
    loans: [...state.loans, { ...loan, id: crypto.randomUUID() }],
  })),
  updateLoan: (id, loan) => set((state: any) => ({
    loans: state.loans.map((l: Loan) => (l.id === id ? { ...l, ...loan } : l)),
  })),
  deleteLoan: (id) => set((state: any) => ({
    loans: state.loans.filter((l: Loan) => l.id !== id),
  })),
});
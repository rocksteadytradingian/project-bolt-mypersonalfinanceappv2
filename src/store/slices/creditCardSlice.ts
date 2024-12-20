import { CreditCard } from '../../types/finance';

export interface CreditCardSlice {
  creditCards: CreditCard[];
  addCreditCard: (creditCard: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (id: string, creditCard: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
}

export const createCreditCardSlice = (set: any): CreditCardSlice => ({
  creditCards: [],
  addCreditCard: (creditCard) => set((state: any) => ({
    creditCards: [...state.creditCards, { ...creditCard, id: crypto.randomUUID() }],
  })),
  updateCreditCard: (id, creditCard) => set((state: any) => ({
    creditCards: state.creditCards.map((c: CreditCard) =>
      c.id === id ? { ...c, ...creditCard } : c
    ),
  })),
  deleteCreditCard: (id) => set((state: any) => ({
    creditCards: state.creditCards.filter((c: CreditCard) => c.id !== id),
  })),
});
import { RecurringTransaction } from '../../types/finance';

export interface RecurringTransactionSlice {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  processRecurringTransactions: () => void;
}

export const createRecurringTransactionSlice = (set: any, get: any): RecurringTransactionSlice => ({
  recurringTransactions: [],
  
  addRecurringTransaction: (transaction) => set((state: any) => ({
    recurringTransactions: [
      ...state.recurringTransactions,
      { ...transaction, id: crypto.randomUUID() },
    ],
  })),

  updateRecurringTransaction: (id, transaction) => set((state: any) => ({
    recurringTransactions: state.recurringTransactions.map((t: RecurringTransaction) =>
      t.id === id ? { ...t, ...transaction } : t
    ),
  })),

  deleteRecurringTransaction: (id) => set((state: any) => ({
    recurringTransactions: state.recurringTransactions.filter((t: RecurringTransaction) => t.id !== id),
  })),

  processRecurringTransactions: () => {
    const state = get();
    const today = new Date();
    
    state.recurringTransactions.forEach((recurring: RecurringTransaction) => {
      const lastOccurrence = new Date(recurring.lastProcessed || recurring.startDate);
      const nextDue = new Date(lastOccurrence);
      
      switch (recurring.frequency) {
        case 'daily':
          nextDue.setDate(nextDue.getDate() + 1);
          break;
        case 'weekly':
          nextDue.setDate(nextDue.getDate() + 7);
          break;
        case 'monthly':
          nextDue.setMonth(nextDue.getMonth() + 1);
          break;
        case 'yearly':
          nextDue.setFullYear(nextDue.getFullYear() + 1);
          break;
      }

      if (nextDue <= today) {
        state.addTransaction({
          date: new Date(),
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.category,
          details: `${recurring.details} (Recurring)`,
          from: recurring.from,
        });

        set((state: any) => ({
          recurringTransactions: state.recurringTransactions.map((t: RecurringTransaction) =>
            t.id === recurring.id
              ? { ...t, lastProcessed: today.toISOString() }
              : t
          ),
        }));
      }
    });
  },
});
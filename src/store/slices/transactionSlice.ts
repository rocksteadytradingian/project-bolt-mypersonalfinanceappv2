import { StateCreator } from 'zustand';
import { handleTransaction } from '../../services/transactions/transactionService';
import { Transaction } from '../../types/finance';

export interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
}

export const createTransactionSlice: StateCreator<TransactionSlice> = (set, get) => ({
  transactions: [],

  addTransaction: async (transaction) => {
    await handleTransaction(transaction);
    set((state) => ({
      transactions: [...state.transactions, transaction]
    }));
  },

  updateTransaction: async (transaction) => {
    await handleTransaction(transaction);
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === transaction.id ? transaction : t
      )
    }));
  },

  deleteTransaction: (transactionId) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== transactionId)
    }));
  }
});

import { Transaction } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';

export const validateTransaction = (transaction: Omit<Transaction, 'id'>): boolean => {
  if (transaction.amount <= 0) {
    console.error('Amount must be greater than 0');
    return false;
  }

  if (transaction.type === 'expense' && !transaction.fundSourceId) {
    console.error('Fund source is required for expenses');
    return false;
  }

  if (transaction.type === 'debt' && !transaction.creditCardId) {
    console.error('Credit card is required for debt transactions');
    return false;
  }

  if (transaction.type === 'expense' && transaction.category === 'Credit Card Payment') {
    if (!transaction.creditCardId) {
      console.error('Credit card selection is required for credit card payment');
      return false;
    }
    if (!transaction.fundSourceId) {
      console.error('Fund source is required for credit card payment');
      return false;
    }
  }

  if (transaction.type === 'expense' && transaction.category === 'Debt Payment') {
    if (!transaction.debtId) {
      console.error('Debt selection is required for debt payment');
      return false;
    }
    if (!transaction.fundSourceId) {
      console.error('Fund source is required for debt payment');
      return false;
    }
  }

  return true;
};
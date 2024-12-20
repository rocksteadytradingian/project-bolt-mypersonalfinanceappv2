import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { TransactionList } from './TransactionList';
import { Transaction } from '../types/finance';

export function TransactionListContainer() {
  const { transactions, updateTransaction, deleteTransaction } = useFinanceStore();

  const handleEdit = (transaction: Transaction) => {
    // For now, just log the edit action
    console.log('Edit transaction:', transaction);
    // You can implement edit functionality later
    // updateTransaction(transaction);
  };

  const handleDelete = (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(transactionId);
    }
  };

  return (
    <TransactionList
      transactions={transactions}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

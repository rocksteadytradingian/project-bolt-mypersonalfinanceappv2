import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '../types/finance';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function TransactionListContainer() {
  const { transactions, updateTransaction, deleteTransaction, addTransaction } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      await addTransaction(transaction);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Add Transaction
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card className="p-6">
          <TransactionForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

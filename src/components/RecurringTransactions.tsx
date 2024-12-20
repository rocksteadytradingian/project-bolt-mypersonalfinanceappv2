import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useFinanceStore } from '../store/useFinanceStore';
import { RecurringTransaction, TransactionType, RecurringFrequency, dateToString } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface RecurringTransactionFormData {
  type: TransactionType;
  amount: number;
  category: string;
  details: string;
  from?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  fundSourceId?: string;
  creditCardId?: string;
  active: boolean;
}

export function RecurringTransactions() {
  const { currentUser } = useAuth();
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState<RecurringTransactionFormData>({
    type: 'expense',
    amount: 0,
    category: '',
    details: '',
    frequency: 'monthly',
    startDate: '',
    active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedTransaction) {
      const updatedTransaction: RecurringTransaction = {
        ...selectedTransaction,
        ...formData,
        updatedAt: now
      };
      updateRecurringTransaction(updatedTransaction);
    } else {
      const newTransaction: Omit<RecurringTransaction, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        createdAt: now,
        updatedAt: now
      };
      addRecurringTransaction(newTransaction);
    }

    setIsAdding(false);
    setSelectedTransaction(null);
    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      details: '',
      frequency: 'monthly',
      startDate: '',
      active: true
    });
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      details: transaction.details,
      from: transaction.from,
      frequency: transaction.frequency,
      startDate: transaction.startDate,
      endDate: transaction.endDate,
      fundSourceId: transaction.fundSourceId,
      creditCardId: transaction.creditCardId,
      active: transaction.active
    });
    setIsAdding(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      deleteRecurringTransaction(transactionId);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Transactions</h2>
        <Button onClick={() => setIsAdding(true)}>Add Recurring Transaction</Button>
      </div>

      {isAdding && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="debt">Debt Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <input
                type="text"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurringFrequency })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedTransaction(null);
                  setFormData({
                    type: 'expense',
                    amount: 0,
                    category: '',
                    details: '',
                    frequency: 'monthly',
                    startDate: '',
                    active: true
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedTransaction ? 'Update' : 'Add'} Recurring Transaction
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurringTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{transaction.details}</h3>
                  <p className="text-sm text-gray-500">{transaction.category}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(transaction)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(transaction.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{transaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span>{formatCurrency(transaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="capitalize">{transaction.frequency.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span>{new Date(transaction.startDate).toLocaleDateString()}</span>
                </div>
                {transaction.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span>{new Date(transaction.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={transaction.active ? 'text-green-600' : 'text-red-600'}>
                    {transaction.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

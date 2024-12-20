import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Transaction, TransactionType } from '../types/finance';
import { TransactionPreview } from './TransactionPreview';
import { TransactionList } from './TransactionList';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const defaultCategories = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Health & Fitness',
  'Income',
  'Investment',
  'Debt Payment',
  'Salary',
  'Freelance',
  'Business',
  'Rent',
  'Mortgage',
  'Insurance',
  'Education',
  'Savings',
  'Gift'
];

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const { transactions } = useFinanceStore();
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [previewTransaction, setPreviewTransaction] = useState<Omit<Transaction, 'id'> | null>(null);

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as TransactionType,
    amount: transaction?.amount || 0,
    date: transaction?.date || now.toISOString().split('T')[0],
    time: transaction?.time || currentTime,
    category: transaction?.category || '',
    details: transaction?.details || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const allCategories = [...defaultCategories, ...customCategories];

  // Get current month's transactions
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === now.getMonth() &&
           transactionDate.getFullYear() === now.getFullYear();
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCategory = () => {
    if (newCategory && !allCategories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory]);
      setFormData({ ...formData, category: newCategory });
      setNewCategory('');
    }
  };

  useEffect(() => {
    if (formData.amount && formData.category) {
      setPreviewTransaction({
        ...formData,
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newTransaction: Omit<Transaction, 'id'> = {
      ...formData,
      userId: '', // Will be set by the service
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newTransaction);
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {['Income', 'Expense', 'Debt Payment', 'Investment'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.toLowerCase().replace(' ', '_') as TransactionType })}
                  className={`px-4 py-2 rounded-md ${
                    formData.type === type.toLowerCase().replace(' ', '_')
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <div className="mt-1 flex space-x-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category"
                  className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategory}
                >
                  Add
                </Button>
              </div>
            </div>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Details</label>
            <input
              type="text"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter transaction details"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" onClick={onCancel} variant="secondary">
              Cancel
            </Button>
            <Button type="submit">
              Add Transaction
            </Button>
          </div>
        </form>
      </Card>

      {previewTransaction && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Transaction Preview</h3>
          <TransactionPreview transaction={previewTransaction as Transaction} />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <TransactionList
          transactions={currentMonthTransactions}
          onEdit={() => {}}
          onDelete={() => {}}
          readOnly
        />
      </div>
    </div>
  );
}

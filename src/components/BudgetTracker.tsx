import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useFinanceStore } from '../store/useFinanceStore';
import { Budget, dateToString } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface BudgetFormData {
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

export function BudgetTracker() {
  const { currentUser } = useAuth();
  const { budgets, addBudget, updateBudget, deleteBudget } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    category: '',
    amount: 0,
    spent: 0,
    period: 'monthly'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedBudget) {
      const updatedBudget: Budget = {
        ...selectedBudget,
        ...formData,
        updatedAt: now
      };
      updateBudget(updatedBudget);
    } else {
      const newBudget: Omit<Budget, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        createdAt: now,
        updatedAt: now
      };
      addBudget(newBudget);
    }

    setIsAdding(false);
    setSelectedBudget(null);
    setFormData({
      category: '',
      amount: 0,
      spent: 0,
      period: 'monthly'
    });
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent,
      period: budget.period
    });
    setIsAdding(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(budgetId);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Tracker</h2>
        <Button onClick={() => setIsAdding(true)}>Add Budget</Button>
      </div>

      {isAdding && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700">Budget Amount</label>
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
              <label className="block text-sm font-medium text-gray-700">Spent Amount</label>
              <input
                type="number"
                value={formData.spent}
                onChange={(e) => setFormData({ ...formData, spent: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Period</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'yearly' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedBudget(null);
                  setFormData({
                    category: '',
                    amount: 0,
                    spent: 0,
                    period: 'monthly'
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedBudget ? 'Update' : 'Add'} Budget
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{budget.category}</h3>
                  <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(budget)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(budget.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span>{formatCurrency(budget.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spent:</span>
                  <span>{formatCurrency(budget.spent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className={budget.amount - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(budget.amount - budget.spent)}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          budget.spent <= budget.amount ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {Math.round((budget.spent / budget.amount) * 100)}% used
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

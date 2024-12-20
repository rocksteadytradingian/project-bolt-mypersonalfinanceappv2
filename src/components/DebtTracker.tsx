import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useFinanceStore } from '../store/useFinanceStore';
import { Debt, dateToString } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

type DebtType = 'credit_card' | 'personal_loan' | 'student_loan' | 'mortgage' | 'other';

interface DebtFormData {
  name: string;
  amount: number;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  type: DebtType;
}

export function DebtTracker() {
  const { currentUser } = useAuth();
  const { debts, addDebt, updateDebt, deleteDebt } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState<DebtFormData>({
    name: '',
    amount: 0,
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
    dueDate: '',
    type: 'credit_card'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedDebt) {
      const updatedDebt: Debt = {
        ...selectedDebt,
        ...formData,
        updatedAt: now
      };
      updateDebt(updatedDebt);
    } else {
      const newDebt: Omit<Debt, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        transactions: [],
        createdAt: now,
        updatedAt: now
      };
      addDebt(newDebt);
    }

    setIsAdding(false);
    setSelectedDebt(null);
    setFormData({
      name: '',
      amount: 0,
      balance: 0,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: '',
      type: 'credit_card'
    });
  };

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setFormData({
      name: debt.name,
      amount: debt.amount,
      balance: debt.balance,
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment,
      dueDate: debt.dueDate,
      type: debt.type
    });
    setIsAdding(true);
  };

  const handleDelete = async (debtId: string) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      deleteDebt(debtId);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Debts</h2>
        <Button onClick={() => setIsAdding(true)}>Add Debt</Button>
      </div>

      {isAdding && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DebtType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="personal_loan">Personal Loan</option>
                <option value="student_loan">Student Loan</option>
                <option value="mortgage">Mortgage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
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
                <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Payment</label>
                <input
                  type="number"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedDebt(null);
                  setFormData({
                    name: '',
                    amount: 0,
                    balance: 0,
                    interestRate: 0,
                    minimumPayment: 0,
                    dueDate: '',
                    type: 'credit_card'
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedDebt ? 'Update' : 'Add'} Debt
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map((debt) => (
          <Card key={debt.id}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{debt.name}</h3>
                  <p className="text-sm text-gray-500">{debt.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(debt)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(debt.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span>{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span>{formatCurrency(debt.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Off:</span>
                  <span>{formatCurrency(debt.amount - debt.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span>{debt.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span>{new Date(debt.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Payment:</span>
                  <span>{formatCurrency(debt.minimumPayment)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

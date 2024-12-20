import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useFinanceStore } from '../store/useFinanceStore';
import { Loan, LoanType, LoanStatus, dateToString } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface LoanFormData {
  name: string;
  lender: string;
  type: LoanType;
  amount: number;
  originalAmount: number;
  balance: number;
  currentBalance: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  paymentAmount: number;
  monthlyPayment: number;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  status: LoanStatus;
  nextPaymentDate: string;
  fundSourceId?: string;
}

export function LoanManagement() {
  const { currentUser } = useAuth();
  const { loans, addLoan, updateLoan, deleteLoan } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState<LoanFormData>({
    name: '',
    lender: '',
    type: 'personal',
    amount: 0,
    originalAmount: 0,
    balance: 0,
    currentBalance: 0,
    interestRate: 0,
    startDate: '',
    endDate: '',
    paymentAmount: 0,
    monthlyPayment: 0,
    paymentFrequency: 'monthly',
    status: 'active',
    nextPaymentDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedLoan) {
      const updatedLoan: Loan = {
        ...selectedLoan,
        ...formData,
        updatedAt: now
      };
      updateLoan(updatedLoan);
    } else {
      const newLoan: Omit<Loan, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        transactions: [],
        createdAt: now,
        updatedAt: now
      };
      addLoan(newLoan);
    }

    setIsAdding(false);
    setSelectedLoan(null);
    setFormData({
      name: '',
      lender: '',
      type: 'personal',
      amount: 0,
      originalAmount: 0,
      balance: 0,
      currentBalance: 0,
      interestRate: 0,
      startDate: '',
      endDate: '',
      paymentAmount: 0,
      monthlyPayment: 0,
      paymentFrequency: 'monthly',
      status: 'active',
      nextPaymentDate: ''
    });
  };

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setFormData({
      name: loan.name,
      lender: loan.lender,
      type: loan.type,
      amount: loan.amount,
      originalAmount: loan.originalAmount,
      balance: loan.balance,
      currentBalance: loan.currentBalance,
      interestRate: loan.interestRate,
      startDate: loan.startDate,
      endDate: loan.endDate,
      paymentAmount: loan.paymentAmount,
      monthlyPayment: loan.monthlyPayment,
      paymentFrequency: loan.paymentFrequency,
      status: loan.status,
      nextPaymentDate: loan.nextPaymentDate,
      fundSourceId: loan.fundSourceId
    });
    setIsAdding(true);
  };

  const handleDelete = async (loanId: string) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      deleteLoan(loanId);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loans</h2>
        <Button onClick={() => setIsAdding(true)}>Add Loan</Button>
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
              <label className="block text-sm font-medium text-gray-700">Lender</label>
              <input
                type="text"
                value={formData.lender}
                onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as LoanType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="personal">Personal</option>
                <option value="mortgage">Mortgage</option>
                <option value="auto">Auto</option>
                <option value="student">Student</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Original Amount</label>
                <input
                  type="number"
                  value={formData.originalAmount}
                  onChange={(e) => setFormData({ ...formData, originalAmount: parseFloat(e.target.value) })}
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
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) })}
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
                <label className="block text-sm font-medium text-gray-700">Monthly Payment</label>
                <input
                  type="number"
                  value={formData.monthlyPayment}
                  onChange={(e) => setFormData({ ...formData, monthlyPayment: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Frequency</label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value as 'monthly' | 'bi-weekly' | 'weekly' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LoanStatus })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="paid_off">Paid Off</option>
                  <option value="defaulted">Defaulted</option>
                  <option value="in_grace_period">In Grace Period</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Next Payment Date</label>
              <input
                type="date"
                value={formData.nextPaymentDate}
                onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
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
                  setSelectedLoan(null);
                  setFormData({
                    name: '',
                    lender: '',
                    type: 'personal',
                    amount: 0,
                    originalAmount: 0,
                    balance: 0,
                    currentBalance: 0,
                    interestRate: 0,
                    startDate: '',
                    endDate: '',
                    paymentAmount: 0,
                    monthlyPayment: 0,
                    paymentFrequency: 'monthly',
                    status: 'active',
                    nextPaymentDate: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedLoan ? 'Update' : 'Add'} Loan
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map((loan) => (
          <Card key={loan.id}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{loan.name}</h3>
                  <p className="text-sm text-gray-500">{loan.lender}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(loan)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(loan.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{loan.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Amount:</span>
                  <span>{formatCurrency(loan.originalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span>{formatCurrency(loan.currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span>{loan.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span>{formatCurrency(loan.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize">{loan.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Payment:</span>
                  <span>{new Date(loan.nextPaymentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

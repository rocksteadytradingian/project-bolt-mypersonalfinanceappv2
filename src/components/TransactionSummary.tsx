import React from 'react';
import { Transaction } from '../types/finance';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/formatters';
import { calculateTotalExpenses, calculateTotalIncome } from '../utils/calculations';

interface SummaryProps {
  transactions: Transaction[];
}

export function TransactionSummary({ transactions }: SummaryProps) {
  const totalExpenses = calculateTotalExpenses(transactions);
  const totalIncome = calculateTotalIncome(transactions);
  const balance = totalIncome - totalExpenses;

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600">Total Income</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`p-4 ${balance >= 0 ? 'bg-blue-50' : 'bg-yellow-50'} rounded-lg`}>
          <p className={`text-sm ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </Card>
  );
}
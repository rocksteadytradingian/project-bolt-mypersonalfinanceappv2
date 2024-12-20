import React from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function RecurringPayables() {
  const recurringTransactions = useFinanceStore((state) => state.recurringTransactions);
  
  const monthlyTotal = recurringTransactions
    .filter(t => t.type === 'expense' && t.frequency === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Recurring Payables</h2>
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <p className="text-sm text-blue-600">Monthly Total</p>
        <p className="text-2xl font-bold text-blue-700">{formatCurrency(monthlyTotal)}</p>
      </div>
      <div className="space-y-2">
        {recurringTransactions
          .filter(t => t.type === 'expense')
          .map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{transaction.details}</p>
                <p className="text-sm text-gray-500">{transaction.frequency}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">{formatCurrency(transaction.amount)}</p>
                <p className="text-sm text-gray-500">Next: {formatDate(new Date(transaction.startDate))}</p>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}
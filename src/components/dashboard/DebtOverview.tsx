import React from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/formatters';

export function DebtOverview() {
  const debts = useFinanceStore((state) => state.debts);
  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const monthlyPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Debt Status</h2>
      <div className="space-y-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">Total Debt</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-600">Monthly Payments</p>
          <p className="text-2xl font-bold text-yellow-700">{formatCurrency(monthlyPayments)}</p>
        </div>
        <div className="space-y-2">
          {debts.map((debt) => (
            <div key={debt.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{debt.name}</span>
              <span className="font-medium">{formatCurrency(debt.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
import React from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/formatters';
import { calculateNetSavings, calculateTotalExpenses, calculateTotalIncome } from '../../utils/calculations';

export function QuickInsights() {
  const transactions = useFinanceStore((state) => state.transactions);
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const netSavings = calculateNetSavings(transactions);
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const topExpenseCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topExpense = Object.entries(topExpenseCategory)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Quick Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600">Savings Rate</p>
          <p className="text-2xl font-bold text-purple-700">{savingsRate.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600">Top Expense Category</p>
          <p className="text-2xl font-bold text-orange-700">
            {topExpense ? topExpense[0] : 'N/A'}
          </p>
        </div>
        <div className="p-4 bg-teal-50 rounded-lg">
          <p className="text-sm text-teal-600">Monthly Average Spending</p>
          <p className="text-2xl font-bold text-teal-700">
            {formatCurrency(totalExpenses / 12)}
          </p>
        </div>
      </div>
    </Card>
  );
}
import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { startOfMonth, endOfMonth } from 'date-fns';

export function BudgetAnalysis() {
  const { budgets, transactions, userProfile } = useFinanceStore();
  
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const budgetStatus = budgets.map(budget => {
    const spent = transactions
      .filter(t => 
        t.type === 'expense' &&
        t.category === budget.category &&
        new Date(t.date) >= monthStart &&
        new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    return {
      ...budget,
      spent,
      remaining,
      percentage,
    };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Budget Analysis</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalBudget, userProfile?.currency)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalSpent, userProfile?.currency)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Remaining</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRemaining, userProfile?.currency)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {budgetStatus.map(budget => (
          <div key={budget.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{budget.category}</span>
              <span className="text-sm text-gray-600">{budget.period}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded- full ${
                  budget.percentage > 100 
                    ? 'bg-red-600' 
                    : budget.percentage > 75 
                      ? 'bg-yellow-600' 
                      : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Budget</p>
                <p className="font-medium">
                  {formatCurrency(budget.amount, userProfile?.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Spent</p>
                <p className="font-medium text-red-600">
                  {formatCurrency(budget.spent, userProfile?.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Remaining</p>
                <p className={`font-medium ${
                  budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(budget.remaining), userProfile?.currency)}
                  {budget.remaining < 0 && ' over'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
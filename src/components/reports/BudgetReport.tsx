import React from 'react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { Budget } from '../../types/finance';

interface BudgetReportProps {
  data: Budget[];
}

export function BudgetReport({ data }: BudgetReportProps) {
  return (
    <div className="space-y-4">
      {data.map((budget, index) => (
        <Card key={index}>
          <h3 className="text-lg font-semibold mb-4">{budget.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Budget</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(budget.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(budget.spent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-lg font-semibold ${budget.amount - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(budget.amount - budget.spent)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                budget.spent <= budget.amount ? 'bg-blue-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
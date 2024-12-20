import React from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];

export function IncomeOverview() {
  const transactions = useFinanceStore((state) => state.transactions);
  
  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const totalIncome = incomeByCategory.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Income Sources</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={incomeByCategory}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {incomeByCategory.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4">
        <p className="text-lg font-semibold text-green-600">
          Total Income: {formatCurrency(totalIncome)}
        </p>
      </div>
    </Card>
  );
}
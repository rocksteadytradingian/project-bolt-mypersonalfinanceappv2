import React from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

export function FundSourcesOverview() {
  const fundSources = useFinanceStore((state) => state.fundSources);
  const totalBalance = fundSources.reduce((sum, source) => sum + source.balance, 0);

  const data = fundSources.map((source) => ({
    name: `${source.bankName} - ${source.accountName}`,
    value: source.balance,
    type: source.accountType,
  }));

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Fund Sources</h2>
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <p className="text-sm text-blue-600">Total Balance</p>
        <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalBalance)}</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
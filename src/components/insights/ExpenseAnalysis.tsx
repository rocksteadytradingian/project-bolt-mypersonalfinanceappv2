import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1',
];

export function ExpenseAnalysis() {
  const { transactions } = useFinanceStore();

  const expenseData = useMemo(() => {
    // Filter expenses from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
    );

    // Group by category
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by amount
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyTrends = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date) >= sixMonthsAgo
    );

    // Group by month
    const monthlyTotals = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array
    return Object.entries(monthlyTotals)
      .map(([month, amount]) => ({ month, amount }));
  }, [transactions]);

  const totalExpenses = expenseData.reduce((sum, { value }) => sum + value, 0);
  const topExpenseCategories = expenseData.slice(0, 5);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Expense Analysis</h2>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">30-Day Summary</h3>
        <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
      </div>

      {/* Top Expense Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Top Expense Categories</h3>
        <div className="space-y-4">
          {topExpenseCategories.map(({ name, value }, index) => (
            <div key={name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-sm text-gray-500">
                  {formatCurrency(value)} ({((value / totalExpenses) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(value / totalExpenses) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="mb-8 h-80">
        <h3 className="text-lg font-medium mb-4">Category Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {expenseData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trends */}
      <div className="h-80">
        <h3 className="text-lg font-medium mb-4">Monthly Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="amount" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

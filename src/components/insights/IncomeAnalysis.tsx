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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = [
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4DB6AC',
];

export function IncomeAnalysis() {
  const { transactions } = useFinanceStore();

  const incomeData = useMemo(() => {
    // Filter income from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const incomes = transactions.filter(t => 
      t.type === 'income' && new Date(t.date) >= thirtyDaysAgo
    );

    // Group by category
    const categoryTotals = incomes.reduce((acc, income) => {
      acc[income.category] = (acc[income.category] || 0) + income.amount;
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

    const incomes = transactions.filter(t => 
      t.type === 'income' && new Date(t.date) >= sixMonthsAgo
    );

    // Group by month
    const monthlyTotals = incomes.reduce((acc, income) => {
      const month = new Date(income.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + income.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array
    return Object.entries(monthlyTotals)
      .map(([month, amount]) => ({ month, amount }));
  }, [transactions]);

  const totalIncome = incomeData.reduce((sum, { value }) => sum + value, 0);
  const topIncomeCategories = incomeData.slice(0, 5);

  // Calculate month-over-month growth
  const monthlyGrowth = useMemo(() => {
    if (monthlyTrends.length < 2) return 0;
    const lastMonth = monthlyTrends[monthlyTrends.length - 1].amount;
    const previousMonth = monthlyTrends[monthlyTrends.length - 2].amount;
    return ((lastMonth - previousMonth) / previousMonth) * 100;
  }, [monthlyTrends]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Income Analysis</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">30-Day Total</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Monthly Growth</h3>
          <p className={`text-3xl font-bold ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {monthlyGrowth.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Top Income Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Income Sources</h3>
        <div className="space-y-4">
          {topIncomeCategories.map(({ name, value }, index) => (
            <div key={name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-sm text-gray-500">
                  {formatCurrency(value)} ({((value / totalIncome) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(value / totalIncome) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income Distribution Chart */}
      <div className="mb-8 h-80">
        <h3 className="text-lg font-medium mb-4">Income Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={incomeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {incomeData.map((entry, index) => (
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
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#4CAF50"
              strokeWidth={2}
              dot={{ fill: '#4CAF50' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Income Stability */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Income Stability Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Regular Income</h4>
            <p className="text-lg font-semibold">
              {((incomeData.filter(d => d.value >= totalIncome * 0.1).length / incomeData.length) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">of total sources</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Largest Source</h4>
            <p className="text-lg font-semibold">
              {incomeData[0]?.name || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {incomeData[0] ? `${((incomeData[0].value / totalIncome) * 100).toFixed(1)}% of total` : ''}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Income Sources</h4>
            <p className="text-lg font-semibold">{incomeData.length}</p>
            <p className="text-xs text-gray-500">active sources</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

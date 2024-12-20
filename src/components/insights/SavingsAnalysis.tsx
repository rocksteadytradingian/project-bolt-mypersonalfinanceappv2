import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Bar,
} from 'recharts';

export function SavingsAnalysis() {
  const { transactions, fundSources } = useFinanceStore();

  const monthlySavings = useMemo(() => {
    // Get last 12 months of data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = transactions
      .filter(t => new Date(t.date) >= twelveMonthsAgo)
      .reduce((acc, transaction) => {
        const month = new Date(transaction.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { income: 0, expenses: 0, savings: 0 };
        }
        if (transaction.type === 'income') {
          acc[month].income += transaction.amount;
        } else {
          acc[month].expenses += transaction.amount;
        }
        acc[month].savings = acc[month].income - acc[month].expenses;
        return acc;
      }, {} as Record<string, { income: number; expenses: number; savings: number; }>);

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        savingsRate: (data.savings / data.income) * 100,
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        return new Date(`${aMonth} 20${aYear}`).getTime() - new Date(`${bMonth} 20${bYear}`).getTime();
      });
  }, [transactions]);

  const savingsMetrics = useMemo(() => {
    const totalSavings = fundSources.reduce((sum, source) => sum + source.balance, 0);
    const lastThreeMonths = monthlySavings.slice(-3);
    const averageMonthlySavings = lastThreeMonths.reduce((sum, month) => sum + month.savings, 0) / lastThreeMonths.length;
    const averageSavingsRate = lastThreeMonths.reduce((sum, month) => sum + month.savingsRate, 0) / lastThreeMonths.length;

    return {
      totalSavings,
      averageMonthlySavings,
      averageSavingsRate,
      monthsToDouble: averageMonthlySavings > 0 ? (totalSavings / averageMonthlySavings) : Infinity,
    };
  }, [fundSources, monthlySavings]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Savings Analysis</h2>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Total Savings</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(savingsMetrics.totalSavings)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-700 mb-1">Average Monthly Savings</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(savingsMetrics.averageMonthlySavings)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-700 mb-1">Average Savings Rate</h3>
          <p className="text-2xl font-bold text-purple-600">
            {savingsMetrics.averageSavingsRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-700 mb-1">Months to Double</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {savingsMetrics.monthsToDouble === Infinity ? '∞' : Math.round(savingsMetrics.monthsToDouble)}
          </p>
        </div>
      </div>

      {/* Monthly Savings Trend */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Monthly Savings Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySavings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ fill: '#4CAF50' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Expenses vs Savings */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Income, Expenses & Savings Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlySavings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" />
              <Bar dataKey="expenses" fill="#FF5252" />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#2196F3"
                strokeWidth={2}
                dot={{ fill: '#2196F3' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Rate Trend */}
      <div>
        <h3 className="text-lg font-medium mb-4">Savings Rate Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySavings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="savingsRate"
                stroke="#9C27B0"
                strokeWidth={2}
                dot={{ fill: '#9C27B0' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

export function SpendingHabits() {
  const { transactions } = useFinanceStore();

  const dailySpending = useMemo(() => {
    // Get spending patterns by day of week
    const dayTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const day = new Date(transaction.date).toLocaleString('en-US', { weekday: 'short' });
        acc[day] = (acc[day] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    // Convert to array and ensure all days are included
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({
      day,
      amount: dayTotals[day] || 0,
    }));
  }, [transactions]);

  const hourlySpending = useMemo(() => {
    // Get spending patterns by hour
    const hourTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const hour = new Date(transaction.date).getHours();
        acc[hour] = (acc[hour] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    // Convert to array with all 24 hours
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: hour.toString().padStart(2, '0') + ':00',
      amount: hourTotals[hour] || 0,
    }));
  }, [transactions]);

  const categoryPatterns = useMemo(() => {
    // Get spending patterns by category
    const patterns = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = {
            category: transaction.category,
            amount: 0,
            frequency: 0,
            avgAmount: 0,
          };
        }
        acc[transaction.category].amount += transaction.amount;
        acc[transaction.category].frequency += 1;
        acc[transaction.category].avgAmount = acc[transaction.category].amount / acc[transaction.category].frequency;
        return acc;
      }, {} as Record<string, { category: string; amount: number; frequency: number; avgAmount: number; }>);

    return Object.values(patterns).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const impulseSpending = useMemo(() => {
    // Consider transactions above 90th percentile as potential impulse spending
    const amounts = transactions
      .filter(t => t.type === 'expense')
      .map(t => t.amount)
      .sort((a, b) => a - b);
    
    const percentile90 = amounts[Math.floor(amounts.length * 0.9)];
    const impulseTransactions = transactions.filter(t => 
      t.type === 'expense' && t.amount > percentile90
    );

    return {
      count: impulseTransactions.length,
      total: impulseTransactions.reduce((sum, t) => sum + t.amount, 0),
      transactions: impulseTransactions,
    };
  }, [transactions]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Spending Habits Analysis</h2>

      {/* Daily Spending Patterns */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Daily Spending Patterns</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Spending Patterns */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Hourly Spending Patterns</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Patterns */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Category Spending Patterns</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryPatterns.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-700 mb-1">Peak Spending Day</h4>
          <p className="text-lg font-semibold">
            {dailySpending.reduce((max, day) => day.amount > max.amount ? day : max).day}
          </p>
          <p className="text-xs text-blue-600">
            Plan your budget accordingly
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-700 mb-1">Peak Spending Time</h4>
          <p className="text-lg font-semibold">
            {hourlySpending.reduce((max, hour) => hour.amount > max.amount ? hour : max).hour}
          </p>
          <p className="text-xs text-purple-600">
            Be mindful during these hours
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-700 mb-1">Most Frequent Category</h4>
          <p className="text-lg font-semibold">
            {categoryPatterns[0]?.category || 'N/A'}
          </p>
          <p className="text-xs text-green-600">
            {categoryPatterns[0] ? `${categoryPatterns[0].frequency} transactions` : ''}
          </p>
        </div>
      </div>

      {/* Impulse Spending Analysis */}
      <div>
        <h3 className="text-lg font-medium mb-4">Impulse Spending Analysis</h3>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-yellow-700 mb-1">Potential Impulse Spending</h4>
              <p className="text-lg font-semibold">{formatCurrency(impulseSpending.total)}</p>
              <p className="text-xs text-yellow-600">{impulseSpending.count} high-value transactions</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-700 mb-1">Recommendation</h4>
              <p className="text-sm text-yellow-600">
                Consider implementing a 24-hour rule for purchases above{' '}
                {formatCurrency(categoryPatterns[0]?.avgAmount || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9FA8DA', '#90CAF9', '#9575CD', '#7986CB',
];

export function CreditCardAnalysis() {
  const { creditCards, transactions } = useFinanceStore();

  const creditCardMetrics = useMemo(() => {
    const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
    const totalBalance = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const availableCredit = totalLimit - totalBalance;
    const utilizationRate = (totalBalance / totalLimit) * 100;

    // Calculate utilization by card
    const utilizationByCard = creditCards.map(card => ({
      name: card.name,
      balance: card.balance,
      limit: card.limit,
      utilization: (card.balance / card.limit) * 100,
    })).sort((a, b) => b.utilization - a.utilization);

    // Get last 30 days of credit card transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions
      .filter(t => 
        t.type === 'expense' &&
        t.paymentMethod === 'credit_card' &&
        new Date(t.date) >= thirtyDaysAgo
      )
      .reduce((acc, t) => {
        const card = creditCards.find(c => c.id === t.creditCardId);
        if (card) {
          if (!acc[card.id]) {
            acc[card.id] = {
              cardName: card.name,
              total: 0,
              transactions: 0,
            };
          }
          acc[card.id].total += t.amount;
          acc[card.id].transactions += 1;
        }
        return acc;
      }, {} as Record<string, { cardName: string; total: number; transactions: number; }>);

    return {
      totalLimit,
      totalBalance,
      availableCredit,
      utilizationRate,
      utilizationByCard,
      recentTransactions: Object.values(recentTransactions),
    };
  }, [creditCards, transactions]);

  const monthlySpending = useMemo(() => {
    // Get last 6 months of credit card spending
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return transactions
      .filter(t => 
        t.type === 'expense' &&
        t.paymentMethod === 'credit_card' &&
        new Date(t.date) >= sixMonthsAgo
      )
      .reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { month, amount: 0 };
        }
        acc[month].amount += t.amount;
        return acc;
      }, {} as Record<string, { month: string; amount: number; }>);
  }, [transactions]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Credit Card Analysis</h2>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Total Credit Limit</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(creditCardMetrics.totalLimit)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-700 mb-1">Total Balance</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(creditCardMetrics.totalBalance)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-700 mb-1">Available Credit</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(creditCardMetrics.availableCredit)}
          </p>
        </div>
        <div className={`${
          creditCardMetrics.utilizationRate <= 30 ? 'bg-green-50' : 
          creditCardMetrics.utilizationRate <= 70 ? 'bg-yellow-50' : 'bg-red-50'
        } p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${
            creditCardMetrics.utilizationRate <= 30 ? 'text-green-700' :
            creditCardMetrics.utilizationRate <= 70 ? 'text-yellow-700' : 'text-red-700'
          } mb-1`}>
            Utilization Rate
          </h3>
          <p className={`text-2xl font-bold ${
            creditCardMetrics.utilizationRate <= 30 ? 'text-green-600' :
            creditCardMetrics.utilizationRate <= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {creditCardMetrics.utilizationRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Utilization by Card */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Credit Utilization by Card</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={creditCardMetrics.utilizationByCard}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'utilization' ? `${value.toFixed(1)}%` : formatCurrency(value),
                  name === 'utilization' ? 'Utilization' : name
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="balance" fill="#FF6B6B" name="Balance" />
              <Bar yAxisId="left" dataKey="limit" fill="#4ECDC4" name="Limit" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilization"
                stroke="#45B7D1"
                name="Utilization %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Spending Trend */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Monthly Spending Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={Object.values(monthlySpending)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity by Card */}
      <div>
        <h3 className="text-lg font-medium mb-4">30-Day Activity by Card</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={creditCardMetrics.recentTransactions}
                dataKey="total"
                nameKey="cardName"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {creditCardMetrics.recentTransactions.map((entry, index) => (
                  <Cell key={entry.cardName} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

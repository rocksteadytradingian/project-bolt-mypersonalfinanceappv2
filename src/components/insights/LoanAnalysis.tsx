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

export function LoanAnalysis() {
  const { loans } = useFinanceStore();

  const loanMetrics = useMemo(() => {
    const totalOriginal = loans.reduce((sum, loan) => sum + loan.originalAmount, 0);
    const totalCurrent = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    const totalPaid = totalOriginal - totalCurrent;
    const averageInterestRate = loans.reduce((sum, loan) => sum + loan.interestRate, 0) / (loans.length || 1);
    const monthlyPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

    // Group by type
    const typeDistribution = loans.reduce((acc, loan) => {
      if (!acc[loan.type]) {
        acc[loan.type] = {
          name: loan.type,
          value: 0,
          count: 0,
        };
      }
      acc[loan.type].value += loan.currentBalance;
      acc[loan.type].count += 1;
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number; }>);

    // Calculate payoff timeline
    const payoffTimeline = loans.map(loan => {
      const monthsRemaining = loan.currentBalance / loan.monthlyPayment;
      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(monthsRemaining));
      return {
        name: loan.name,
        balance: loan.currentBalance,
        monthsRemaining: Math.ceil(monthsRemaining),
        payoffDate: payoffDate.toLocaleDateString(),
      };
    }).sort((a, b) => a.monthsRemaining - b.monthsRemaining);

    return {
      totalOriginal,
      totalCurrent,
      totalPaid,
      averageInterestRate,
      monthlyPayments,
      typeDistribution: Object.values(typeDistribution),
      payoffTimeline,
    };
  }, [loans]);

  const amortizationSchedule = useMemo(() => {
    // Project next 12 months of payments
    const schedule = Array.from({ length: 12 }, (_, month) => {
      const date = new Date();
      date.setMonth(date.getMonth() + month);
      const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      return {
        month: monthLabel,
        principal: 0,
        interest: 0,
        balance: 0,
      };
    });

    loans.forEach(loan => {
      let remainingBalance = loan.currentBalance;
      const monthlyRate = loan.interestRate / 12 / 100;

      schedule.forEach((month, index) => {
        if (remainingBalance > 0) {
          const interest = remainingBalance * monthlyRate;
          const principal = Math.min(loan.monthlyPayment - interest, remainingBalance);
          
          month.principal += principal;
          month.interest += interest;
          remainingBalance -= principal;
          month.balance += remainingBalance;
        }
      });
    });

    return schedule;
  }, [loans]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Loan Analysis</h2>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Total Original Amount</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(loanMetrics.totalOriginal)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-700 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(loanMetrics.totalPaid)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-700 mb-1">Current Balance</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(loanMetrics.totalCurrent)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-700 mb-1">Average Interest Rate</h3>
          <p className="text-2xl font-bold text-purple-600">
            {loanMetrics.averageInterestRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-700 mb-1">Monthly Payments</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {formatCurrency(loanMetrics.monthlyPayments)}
          </p>
        </div>
      </div>

      {/* Loan Type Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Loan Distribution by Type</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={loanMetrics.typeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {loanMetrics.typeDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Amortization Schedule */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">12-Month Amortization Projection</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={amortizationSchedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="principal"
                stroke="#4CAF50"
                name="Principal"
              />
              <Line
                type="monotone"
                dataKey="interest"
                stroke="#FF5252"
                name="Interest"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2196F3"
                name="Remaining Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payoff Timeline */}
      <div>
        <h3 className="text-lg font-medium mb-4">Loan Payoff Timeline</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loanMetrics.payoffTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${Math.round(value)} months`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'monthsRemaining'
                    ? `${Math.round(value)} months`
                    : formatCurrency(value),
                  name === 'monthsRemaining' ? 'Time to Payoff' : 'Current Balance'
                ]}
              />
              <Legend />
              <Bar dataKey="monthsRemaining" fill="#FF9800" name="Months to Payoff" />
              <Bar dataKey="balance" fill="#2196F3" name="Current Balance" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

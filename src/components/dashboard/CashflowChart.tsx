import React from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { startOfMonth, format } from 'date-fns';

export function CashflowChart() {
  const transactions = useFinanceStore((state) => state.transactions);
  
  const monthlyCashflow = transactions.reduce((acc, t) => {
    const monthKey = format(startOfMonth(new Date(t.date)), 'MMM yyyy');
    const existing = acc.find(item => item.month === monthKey);
    
    if (existing) {
      if (t.type === 'income') {
        existing.income += t.amount;
      } else if (t.type === 'expense') {
        existing.expenses += t.amount;
      }
      existing.balance = existing.income - existing.expenses;
    } else {
      acc.push({
        month: monthKey,
        income: t.type === 'income' ? t.amount : 0,
        expenses: t.type === 'expense' ? t.amount : 0,
        balance: t.type === 'income' ? t.amount : -t.amount,
      });
    }
    return acc;
  }, [] as { month: string; income: number; expenses: number; balance: number }[]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Monthly Cashflow</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyCashflow}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
            <Line type="monotone" dataKey="balance" stroke="#3B82F6" name="Balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
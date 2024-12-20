import React from 'react';
import { Card } from '../ui/Card';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/formatters';

export function DebtAnalysis() {
  const { debts, transactions } = useFinanceStore();

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaidOff = totalOriginalDebt - totalDebt;
  const percentagePaidOff = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0;

  // Get recent debt payments
  const recentDebtPayments = transactions
    .filter(t => t.type === 'debt')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate monthly debt payments
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthlyDebtPayments = transactions
    .filter(t => t.type === 'debt' && new Date(t.date) >= firstDayOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Debt Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Debt</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Paid Off</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaidOff)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-2xl font-bold">{percentagePaidOff.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${percentagePaidOff}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Debt Payments</h3>
            {recentDebtPayments.length > 0 ? (
              <div className="space-y-4">
                {recentDebtPayments.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.details}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-medium text-green-600">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent debt payments</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Payments This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlyDebtPayments)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Debts</p>
                <p className="text-2xl font-bold">{debts.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

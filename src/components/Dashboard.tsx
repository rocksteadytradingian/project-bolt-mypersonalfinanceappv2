import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/formatters';
import { ExpenseAnalysis } from './insights/ExpenseAnalysis';
import { IncomeAnalysis } from './insights/IncomeAnalysis';
import { SpendingHabits } from './insights/SpendingHabits';
import { BudgetTracker } from './BudgetTracker';
import { Investment } from '../types/finance';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { userProfile } = useAuth();
  const { 
    transactions,
    fundSources,
    creditCards,
    debts,
    loans,
    investments
  } = useFinanceStore();

  // Calculate total balances
  const totalFundSources = fundSources.reduce((sum, source) => sum + source.balance, 0);
  const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalLoans = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const totalInvestments = investments.reduce((sum: number, inv: Investment) => 
    sum + (inv.currentValue * inv.quantity), 0);

  // Calculate net worth
  const netWorth = totalFundSources + totalInvestments - totalCreditCardDebt - totalDebts - totalLoans;

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900">Total Assets</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(totalFundSources + totalInvestments)}
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Fund Sources</span>
              <span className="text-sm font-medium">{formatCurrency(totalFundSources)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Investments</span>
              <span className="text-sm font-medium">{formatCurrency(totalInvestments)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900">Total Liabilities</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(totalCreditCardDebt + totalDebts + totalLoans)}
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Credit Cards</span>
              <span className="text-sm font-medium">{formatCurrency(totalCreditCardDebt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Debts</span>
              <span className="text-sm font-medium">{formatCurrency(totalDebts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Loans</span>
              <span className="text-sm font-medium">{formatCurrency(totalLoans)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900">Net Worth</h3>
          <p className={`mt-2 text-3xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netWorth)}
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${netWorth >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                style={{
                  width: `${Math.min(Math.abs(netWorth) / (totalFundSources + totalInvestments) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-neutral-500 py-4">No recent transactions</p>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{transaction.details}</p>
                  <p className="text-sm text-gray-500">{transaction.category}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-medium ${
                  transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseAnalysis />
        <IncomeAnalysis />
      </div>

      {/* Budget Overview */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
        <BudgetTracker />
      </Card>

      {/* Spending Habits */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Habits</h3>
        <SpendingHabits />
      </Card>
    </div>
  );
}

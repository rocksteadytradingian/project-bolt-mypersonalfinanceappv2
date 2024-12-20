import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TransactionList } from '../TransactionList';
import { formatCurrency } from '../../utils/formatters';
import { differenceInMonths } from 'date-fns';

export function LoanDetails() {
  const { id } = useParams<{ id: string }>();
  const { loans, transactions, fundSources } = useFinanceStore();
  
  const loan = loans.find(l => l.id === id);
  const loanTransactions = transactions.filter(t => t.loanId === id);
  const fundSource = loan?.fundSourceId ? fundSources.find(f => f.id === loan.fundSourceId) : null;
  
  const totalPaid = loanTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingMonths = loan ? differenceInMonths(new Date(loan.endDate), new Date()) : 0;
  const progress = loan ? ((loan.originalAmount - loan.currentBalance) / loan.originalAmount) * 100 : 0;

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Loan Not Found</h2>
        <Link to="/loans" className="text-blue-600 hover:text-blue-800">
          Return to Loans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{loan.name}</h1>
        <Link to="/loans">
          <Button variant="secondary">Back to Loans</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current Balance</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(loan.currentBalance)}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Paid</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Payment</h3>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(loan.monthlyPayment)}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Loan Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(loan.originalAmount - loan.currentBalance)} of {formatCurrency(loan.originalAmount)}
              </span>
              <span className="text-sm font-medium text-gray-600">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Interest Rate</p>
              <p className="text-lg font-semibold">{loan.interestRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Term</p>
              <p className="text-lg font-semibold">{remainingMonths} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Payment</p>
              <p className="text-lg font-semibold">{new Date(loan.nextPaymentDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${
                loan.status === 'paid' 
                  ? 'text-green-600' 
                  : loan.status === 'defaulted' 
                    ? 'text-red-600' 
                    : 'text-blue-600'
              }`}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {fundSource && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Payment Source</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{fundSource.bankName}</p>
              <p className="text-sm text-gray-600">{fundSource.accountName}</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(fundSource.balance)}</p>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <TransactionList 
          transactions={loanTransactions} 
          onEdit={() => {}} 
          onDelete={() => {}} 
          readOnly={true}
        />
      </Card>
    </div>
  );
}
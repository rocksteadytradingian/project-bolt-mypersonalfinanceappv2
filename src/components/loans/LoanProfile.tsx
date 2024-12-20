import React from 'react';
import { Link } from 'react-router-dom';
import { Loan, Transaction } from '../../types/finance';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { differenceInMonths } from 'date-fns';

interface LoanProfileProps {
  loan: Loan;
  transactions: Transaction[];
}

export function LoanProfile({ loan, transactions }: LoanProfileProps) {
  const totalPaid = transactions
    .filter(t => t.loanId === loan.id)
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingMonths = differenceInMonths(new Date(loan.endDate), new Date());
  const progress = ((loan.originalAmount - loan.currentBalance) / loan.originalAmount) * 100;

  return (
    <Link to={`/loans/${loan.id}`}>
      <Card className="relative overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full" />
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{loan.name}</h2>
              <p className="text-gray-600">{loan.lender}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Status</p>
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

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(loan.currentBalance)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Monthly Payment</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(loan.monthlyPayment)}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Interest Rate</p>
                <p className="font-medium">{loan.interestRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Remaining Term</p>
                <p className="font-medium">{remainingMonths} months</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
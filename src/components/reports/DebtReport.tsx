import React from 'react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { Debt } from '../../types/finance';

interface DebtReportProps {
  data: Debt[];
}

export function DebtReport({ data }: DebtReportProps) {
  const totalDebt = data.reduce((sum, debt) => sum + debt.amount, 0);
  const totalMinPayments = data.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Debt</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(totalDebt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Monthly Payments</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(totalMinPayments)}
            </p>
          </div>
        </div>
      </Card>

      {data.map((debt, index) => (
        <Card key={index}>
          <h3 className="text-lg font-semibold mb-4">{debt.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(debt.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interest Rate</p>
              <p className="text-lg font-semibold">
                {debt.interestRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Minimum Payment</p>
              <p className="text-lg font-semibold">
                {formatCurrency(debt.minimumPayment)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
import React from 'react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { RecurringTransaction } from '../../types/finance';

interface RecurringReportProps {
  data: RecurringTransaction[];
}

export function RecurringReport({ data }: RecurringReportProps) {
  const totalMonthly = data
    .filter(t => t.frequency === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Total Monthly Recurring</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatCurrency(totalMonthly)}
          </p>
        </div>
      </Card>

      {data.map((recurring, index) => (
        <Card key={index}>
          <h3 className="text-lg font-semibold mb-4">{recurring.details}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className={`text-lg font-semibold ${
                recurring.type === 'expense' ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(recurring.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Frequency</p>
              <p className="text-lg font-semibold capitalize">
                {recurring.frequency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-lg font-semibold">
                {recurring.category}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
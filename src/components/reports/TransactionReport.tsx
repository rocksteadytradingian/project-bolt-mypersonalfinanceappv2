import React from 'react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { TransactionList } from '../TransactionList';
import { Transaction } from '../../types/finance';

interface TransactionReportProps {
  data: Transaction[];
  summary?: Record<string, number>;
}

export function TransactionReport({ data, summary }: TransactionReportProps) {
  return (
    <div className="space-y-6">
      {summary && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(summary.income)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(summary.expenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Debt Payments</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(summary.debt)}
              </p>
            </div>
          </div>
        </Card>
      )}
      
      <Card>
        <TransactionList 
          transactions={data}
          onEdit={() => {}}
          onDelete={() => {}}
          readOnly={true}
        />
      </Card>
    </div>
  );
}
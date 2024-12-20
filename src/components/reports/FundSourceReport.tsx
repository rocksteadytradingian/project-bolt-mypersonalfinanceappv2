import React from 'react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { TransactionList } from '../TransactionList';

interface FundSourceReportData {
  bankName: string;
  accountName: string;
  balance: number;
  income: number;
  expenses: number;
  netFlow: number;
  transactions: any[];
}

interface FundSourceReportProps {
  data: FundSourceReportData[];
}

export function FundSourceReport({ data }: FundSourceReportProps) {
  return (
    <div className="space-y-6">
      {data.map((source, index) => (
        <Card key={index}>
          <h3 className="text-lg font-semibold mb-4">{source.bankName} - {source.accountName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Income</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(source.income)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(source.expenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Flow</p>
              <p className={`text-lg font-semibold ${source.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(source.netFlow)}
              </p>
            </div>
          </div>
          <TransactionList 
            transactions={source.transactions}
            onEdit={() => {}}
            onDelete={() => {}}
            readOnly={true}
          />
        </Card>
      ))}
    </div>
  );
}
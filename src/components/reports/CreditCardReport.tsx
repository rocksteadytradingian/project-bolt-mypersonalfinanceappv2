import React from 'react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { TransactionList } from '../TransactionList';
import { CreditCard, Transaction } from '../../types/finance';

interface CreditCardReportData extends CreditCard {
  transactions: Transaction[];
  charges: number;
}

interface CreditCardReportProps {
  data: CreditCardReportData[];
}

export function CreditCardReport({ data }: CreditCardReportProps) {
  return (
    <div className="space-y-6">
      {data.map((card, index) => (
        <Card key={index}>
          <h3 className="text-lg font-semibold mb-4">{card.bankName} - {card.cardName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Credit Limit</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(card.creditLimit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(card.currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Credit</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(card.creditLimit - card.currentBalance)}
              </p>
            </div>
          </div>
          <TransactionList 
            transactions={card.transactions}
            onEdit={() => {}}
            onDelete={() => {}}
            readOnly={true}
          />
        </Card>
      ))}
    </div>
  );
}

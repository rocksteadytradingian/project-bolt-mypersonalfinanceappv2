import React from 'react';
import { useParams } from 'react-router-dom';
import { useFinanceStore } from '../../store/useFinanceStore';
import { TransactionList } from '../TransactionList';
import { Card } from '../ui/Card';

export function FundSourceTransactions() {
  const { id } = useParams<{ id: string }>();
  const { fundSources } = useFinanceStore();
  
  const fundSource = fundSources.find(fs => fs.id === id);
  
  if (!fundSource) {
    return (
      <Card>
        <div className="p-4 text-center text-gray-500">
          Fund source not found
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {fundSource.accountName} Transactions
        </h2>
        <div className="mb-4">
          <p className="text-gray-600">
            Current Balance: <span className="font-semibold">${fundSource.currentBalance.toFixed(2)}</span>
          </p>
          <p className="text-gray-600">
            Monthly Flow: <span className="font-semibold">${fundSource.monthlyFlow?.toFixed(2) || '0.00'}</span>
          </p>
        </div>
      </Card>

      <TransactionList
        transactions={fundSource.transactions}
        onEdit={() => {}}
        onDelete={() => {}}
        readOnly
      />
    </div>
  );
}

import React from 'react';
import { Card } from '../ui/Card';
import { FundSource } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface FundSourceDetailsProps {
  source: FundSource;
}

export function FundSourceDetails({ source }: FundSourceDetailsProps) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">{source.bankName}: {source.accountName}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Account Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span>{source.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span>{source.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span>{source.accountType}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Balance Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="text-xl font-semibold">{formatCurrency(source.currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Flow:</span>
                  <span className="text-xl font-semibold">{formatCurrency(source.monthlyFlow || 0)}</span>
                </div>
                {source.lastUpdated && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{new Date(source.lastUpdated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Transaction Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Transactions:</span>
                <span>{source.transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recent Activity:</span>
                <span>
                  {source.transactions.length > 0
                    ? new Date(source.transactions[0].date).toLocaleDateString()
                    : 'No transactions'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

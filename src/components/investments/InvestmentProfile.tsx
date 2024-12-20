import React from 'react';
import { Link } from 'react-router-dom';
import { Investment } from '../../types/finance';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface InvestmentProfileProps {
  investment: Investment;
}

export function InvestmentProfile({ investment }: InvestmentProfileProps) {
  const totalValue = investment.currentValue * investment.quantity;
  const totalCost = investment.purchasePrice * investment.quantity;
  const gainLoss = totalValue - totalCost;
  const gainLossPercentage = ((gainLoss / totalCost) * 100);

  return (
    <Link to={`/investments/${investment.id}`}>
      <Card className="relative overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full" />
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{investment.name}</h2>
              <p className="text-gray-600 capitalize">
                {investment.type.replace('_', ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${
                investment.status === 'active' 
                  ? 'text-green-600' 
                  : investment.status === 'sold'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
              }`}>
                {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Gain/Loss</p>
              <p className={`text-2xl font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(gainLoss)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Return</span>
              <span className={gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                {gainLossPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  gainLossPercentage >= 0 ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ 
                  width: `${Math.min(Math.abs(gainLossPercentage), 100)}%`,
                  marginLeft: gainLossPercentage < 0 ? 'auto' : undefined,
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-medium">{investment.quantity}</p>
              </div>
              <div>
                <p className="text-gray-600">Purchase Price</p>
                <p className="font-medium">{formatCurrency(investment.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Price</p>
                <p className="font-medium">{formatCurrency(investment.currentValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
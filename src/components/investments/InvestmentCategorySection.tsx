import React from 'react';
import { Card } from '../ui/Card';
import { InvestmentCategory } from '../../types/finance';

const categoryDescriptions: Record<InvestmentCategory, string> = {
  stocks: 'Individual company shares traded on stock exchanges.',
  bonds: 'Fixed-income debt securities issued by governments and corporations.',
  mutual_funds: 'Professionally managed investment funds that pool money from multiple investors.',
  etfs: 'Exchange-traded funds that track indexes, commodities, or baskets of assets.',
  crypto: 'Digital or virtual currencies using cryptography for security.',
  real_estate: 'Property investments including residential, commercial, and REITs.',
  traditional: 'Traditional investment vehicles like time deposits and government securities.',
  alternative: 'Alternative investments like real estate, Pag-IBIG MP2, cooperatives, and precious metals.',
  digital: 'Digital assets and technology-focused investments.',
  business: 'Direct business investments and entrepreneurial ventures.',
  retirement: 'Retirement-focused investment accounts and pension funds.',
  other: 'Other investment types not covered by the main categories.'
};

interface InvestmentCategorySectionProps {
  category: InvestmentCategory;
  totalValue: number;
  percentageOfPortfolio: number;
}

export function InvestmentCategorySection({ category, totalValue, percentageOfPortfolio }: InvestmentCategorySectionProps) {
  const getDescription = (category: InvestmentCategory): string => {
    return categoryDescriptions[category] || 'No description available.';
  };

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold capitalize mb-2">
          {category.replace('_', ' ')}
        </h3>
        <p className="text-gray-600 mb-4">{getDescription(category)}</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-medium">${totalValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Portfolio %:</span>
            <span className="font-medium">{percentageOfPortfolio.toFixed(2)}%</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${percentageOfPortfolio}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

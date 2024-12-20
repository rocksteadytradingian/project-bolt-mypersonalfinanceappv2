import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { InvestmentType, InvestmentRiskLevel } from '../../types/finance';

interface InvestmentInfo {
  type: string;
  risk: InvestmentRiskLevel;
  returns: string;
  description: string;
}

const investmentInfo: InvestmentInfo[] = [
  {
    type: 'Stocks',
    risk: 'high',
    returns: 'High',
    description: 'Directly buy shares of publicly listed companies via the Philippine Stock Exchange (PSE).'
  },
  {
    type: 'Mutual Funds/UITF',
    risk: 'medium',
    returns: 'Medium to High',
    description: 'Pooled funds managed by professional fund managers. Available in various types like Equity, Bond, Balanced, and Money Market Funds.'
  },
  {
    type: 'REIT',
    risk: 'medium',
    returns: 'Moderate',
    description: 'Investment in income-generating properties like office buildings and malls. Listed on the PSE.'
  },
  {
    type: 'Bonds',
    risk: 'low',
    returns: 'Low to Moderate',
    description: 'Government Bonds (RTBs) and Corporate Bonds offered via banks or financial institutions.'
  },
  {
    type: 'Cryptocurrency',
    risk: 'high',
    returns: 'High',
    description: 'Digital assets like Bitcoin, Ethereum, etc. Available through platforms like Binance, Coins.ph.'
  },
  {
    type: 'Pag-IBIG MP2',
    risk: 'low',
    returns: 'Moderate',
    description: 'A government-backed savings program offering tax-free dividends.'
  },
  {
    type: 'Time Deposits/Savings',
    risk: 'very_low',
    returns: 'Low',
    description: 'Low-risk investment with minimal returns. Digital banks offer higher interest rates.'
  },
  {
    type: 'VUL Insurance',
    risk: 'medium',
    returns: 'Moderate',
    description: 'Life insurance combined with investment in mutual funds.'
  }
];

export function InvestmentInfoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === investmentInfo.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change slide every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === investmentInfo.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? investmentInfo.length - 1 : prevIndex - 1
    );
  };

  const getRiskColor = (risk: InvestmentRiskLevel) => {
    switch (risk) {
      case 'very_low':
        return 'text-blue-600';
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'very_high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getReturnsColor = (returns: string) => {
    switch (returns.toLowerCase()) {
      case 'low':
        return 'text-blue-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'high':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="relative overflow-hidden mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/50 text-white rounded-full p-2 hover:bg-gray-800/75 transition-colors z-10"
        >
          ←
        </button>
        
        <div className="px-12 py-4 w-full">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">{investmentInfo[currentIndex].type}</h3>
            <div className="flex justify-center space-x-4 mb-2">
              <span className={`font-semibold ${getRiskColor(investmentInfo[currentIndex].risk)}`}>
                Risk: {investmentInfo[currentIndex].risk.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`font-semibold ${getReturnsColor(investmentInfo[currentIndex].returns)}`}>
                Returns: {investmentInfo[currentIndex].returns}
              </span>
            </div>
            <p className="text-gray-600">{investmentInfo[currentIndex].description}</p>
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/50 text-white rounded-full p-2 hover:bg-gray-800/75 transition-colors z-10"
        >
          →
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {investmentInfo.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Play/Pause button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
      >
        {isPlaying ? '⏸' : '▶️'}
      </button>
    </Card>
  );
}

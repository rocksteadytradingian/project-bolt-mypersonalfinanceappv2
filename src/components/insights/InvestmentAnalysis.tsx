import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { Investment, InvestmentCategory } from '../../types/finance';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
];

interface CategoryData {
  name: string;
  value: number;
  originalValue: number;
  gain: number;
}

interface RiskData {
  name: string;
  value: number;
}

interface PerformanceData {
  name: string;
  gain: number;
  value: number;
}

export function InvestmentAnalysis() {
  const { investments } = useFinanceStore();

  const portfolioMetrics = useMemo(() => {
    const totalInvested = investments.reduce((sum: number, inv: Investment) => 
      sum + inv.purchasePrice * inv.quantity, 0);
    const currentValue = investments.reduce((sum: number, inv: Investment) => 
      sum + inv.currentValue * inv.quantity, 0);
    const totalGain = currentValue - totalInvested;
    const percentageGain = (totalGain / totalInvested) * 100;

    // Group by category
    const categoryData = investments.reduce((acc: Record<string, CategoryData>, inv: Investment) => {
      if (!acc[inv.category]) {
        acc[inv.category] = {
          name: inv.category,
          value: 0,
          originalValue: 0,
          gain: 0,
        };
      }
      const currentTotal = inv.currentValue * inv.quantity;
      const originalTotal = inv.purchasePrice * inv.quantity;
      acc[inv.category].value += currentTotal;
      acc[inv.category].originalValue += originalTotal;
      acc[inv.category].gain += currentTotal - originalTotal;
      return acc;
    }, {});

    // Group by risk level
    const riskData = investments.reduce((acc: Record<string, RiskData>, inv: Investment) => {
      if (!acc[inv.riskLevel]) {
        acc[inv.riskLevel] = {
          name: inv.riskLevel,
          value: 0,
        };
      }
      acc[inv.riskLevel].value += inv.currentValue * inv.quantity;
      return acc;
    }, {});

    return {
      totalInvested,
      currentValue,
      totalGain,
      percentageGain,
      categoryDistribution: Object.values(categoryData),
      riskDistribution: Object.values(riskData),
    };
  }, [investments]);

  const performanceData = useMemo(() => {
    return investments
      .map((inv: Investment): PerformanceData => ({
        name: inv.name,
        gain: ((inv.currentValue - inv.purchasePrice) / inv.purchasePrice) * 100,
        value: inv.currentValue * inv.quantity,
      }))
      .sort((a, b) => b.gain - a.gain);
  }, [investments]);

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Investment Analysis</h2>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Total Invested</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(portfolioMetrics.totalInvested)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-700 mb-1">Current Value</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(portfolioMetrics.currentValue)}
          </p>
        </div>
        <div className={`${portfolioMetrics.totalGain >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${portfolioMetrics.totalGain >= 0 ? 'text-green-700' : 'text-red-700'} mb-1`}>
            Total Gain/Loss
          </h3>
          <p className={`text-2xl font-bold ${portfolioMetrics.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(portfolioMetrics.totalGain)}
          </p>
        </div>
        <div className={`${portfolioMetrics.percentageGain >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${portfolioMetrics.percentageGain >= 0 ? 'text-green-700' : 'text-red-700'} mb-1`}>
            Percentage Gain/Loss
          </h3>
          <p className={`text-2xl font-bold ${portfolioMetrics.percentageGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioMetrics.percentageGain.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Portfolio Distribution by Category</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioMetrics.categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {portfolioMetrics.categoryDistribution.map((entry: CategoryData, index: number) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Portfolio Distribution by Risk Level</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioMetrics.riskDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {portfolioMetrics.riskDistribution.map((entry: RiskData, index: number) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Comparison */}
      <div>
        <h3 className="text-lg font-medium mb-4">Investment Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'gain' ? `${value.toFixed(2)}%` : formatCurrency(value),
                  name === 'gain' ? 'Return' : 'Value'
                ]}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="gain"
                stroke="#82ca9d"
                name="Return"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                name="Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

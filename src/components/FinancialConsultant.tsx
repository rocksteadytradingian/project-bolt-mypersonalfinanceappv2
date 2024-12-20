import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AnthropicProvider } from '../services/ai/providers/anthropic';

const aiProvider = AnthropicProvider.getInstance({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
});

type AdviceArea = 'general' | 'debt' | 'investments' | 'budget';

export function FinancialConsultant() {
  const store = useFinanceStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AdviceArea>('general');
  const [advice, setAdvice] = useState<string | null>(null);
  const [spendingAnalysis, setSpendingAnalysis] = useState<string | null>(null);

  // Fetch initial insights and alerts
  useEffect(() => {
    fetchInsights();
    fetchAlerts();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await aiProvider.generateInsights(store);
      setInsights(response);
      setError(null);
    } catch (err) {
      setError('Failed to generate insights. Please try again later.');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await aiProvider.getAlerts(store);
      setAlerts(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts. Please try again later.');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvice = async (area: AdviceArea) => {
    try {
      setLoading(true);
      const response = await aiProvider.getFinancialAdvice(store, area);
      setAdvice(response);
      setError(null);
    } catch (err) {
      setError('Failed to get advice. Please try again later.');
      console.error('Error fetching advice:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpendingAnalysis = async () => {
    try {
      setLoading(true);
      const response = await aiProvider.analyzeSpendingPatterns(store.transactions);
      setSpendingAnalysis(response);
      setError(null);
    } catch (err) {
      setError('Failed to analyze spending patterns. Please try again later.');
      console.error('Error analyzing spending:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (area: AdviceArea) => {
    setSelectedArea(area);
    fetchAdvice(area);
  };

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts && (
        <Card className="bg-red-50 dark:bg-red-900/20">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              🚨 Financial Alerts
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: alerts.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </Card>
      )}

      {/* Main Insights Section */}
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">💡 Financial Insights</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400">{error}</div>
          ) : insights ? (
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
            </div>
          ) : null}
          <div className="mt-4">
            <Button onClick={fetchInsights} disabled={loading}>
              Refresh Insights
            </Button>
          </div>
        </div>
      </Card>

      {/* Specific Advice Section */}
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">🎯 Financial Advice</h2>
          <div className="flex space-x-2 mb-4">
            <Button
              variant={selectedArea === 'general' ? 'primary' : 'secondary'}
              onClick={() => handleAreaChange('general')}
              disabled={loading}
            >
              General
            </Button>
            <Button
              variant={selectedArea === 'debt' ? 'primary' : 'secondary'}
              onClick={() => handleAreaChange('debt')}
              disabled={loading}
            >
              Debt
            </Button>
            <Button
              variant={selectedArea === 'investments' ? 'primary' : 'secondary'}
              onClick={() => handleAreaChange('investments')}
              disabled={loading}
            >
              Investments
            </Button>
            <Button
              variant={selectedArea === 'budget' ? 'primary' : 'secondary'}
              onClick={() => handleAreaChange('budget')}
              disabled={loading}
            >
              Budget
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : advice ? (
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br/>') }} />
            </div>
          ) : null}
        </div>
      </Card>

      {/* Spending Analysis Section */}
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">📊 Spending Analysis</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : spendingAnalysis ? (
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: spendingAnalysis.replace(/\n/g, '<br/>') }} />
            </div>
          ) : null}
          <div className="mt-4">
            <Button onClick={fetchSpendingAnalysis} disabled={loading}>
              Analyze Spending
            </Button>
          </div>
        </div>
      </Card>

      {/* Refresh All Section */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => {
            fetchInsights();
            fetchAlerts();
            fetchAdvice(selectedArea);
            fetchSpendingAnalysis();
          }}
          disabled={loading}
        >
          Refresh All
        </Button>
      </div>
    </div>
  );
}

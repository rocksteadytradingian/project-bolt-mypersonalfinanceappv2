import { useMemo } from 'react';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useFinanceStore } from '../store/useFinanceStore';
import { ReportType, ReportData } from '../types/reports';

export const useReportData = (
  reportType: ReportType,
  dateRange: { startDate: string; endDate: string }
): ReportData | null => {
  const store = useFinanceStore();

  return useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;

    const start = startOfDay(new Date(dateRange.startDate));
    const end = endOfDay(new Date(dateRange.endDate));

    const isInRange = (date: Date) => 
      isWithinInterval(date, { start, end });

    const filteredTransactions = store.transactions.filter(t => 
      isInRange(new Date(t.date))
    );

    switch (reportType) {
      case 'fund-sources': {
        const fundSourceStats = store.fundSources.map(source => {
          const sourceTransactions = filteredTransactions.filter(t => 
            t.fundSourceId === source.id
          );
          const income = sourceTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const expenses = sourceTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          return {
            ...source,
            transactions: sourceTransactions,
            income,
            expenses,
            netFlow: income - expenses,
          };
        });
        return { type: 'fund-sources', data: fundSourceStats };
      }

      case 'transactions':
        return { 
          type: 'transactions', 
          data: filteredTransactions,
          summary: {
            income: filteredTransactions
              .filter(t => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0),
            expenses: filteredTransactions
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0),
            debt: filteredTransactions
              .filter(t => t.type === 'debt')
              .reduce((sum, t) => sum + t.amount, 0),
          }
        };

      // Add other report types here...
      
      default:
        return null;
    }
  }, [reportType, dateRange, store]);
};
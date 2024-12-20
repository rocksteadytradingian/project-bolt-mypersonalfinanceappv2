import { FinancialData } from './types';
import { formatCurrency } from '../../utils/formatters';

class AIService {
  async generateResponse(prompt: string, financialData: FinancialData): Promise<string> {
    const totalIncome = financialData.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = financialData.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : '0';

    return `Based on your financial data:
- Your total income is ${formatCurrency(totalIncome, financialData.currency)}
- Your total expenses are ${formatCurrency(totalExpenses, financialData.currency)}
- Your net income is ${formatCurrency(netIncome, financialData.currency)}
- Your savings rate is ${savingsRate}%

Would you like specific advice about budgeting, saving, or debt management?`;
  }
}

export const aiService = new AIService();
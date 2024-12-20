import OpenAI from 'openai';
import { AIProvider, FinancialData } from '../types';
import { formatCurrency } from '../../../utils/formatters';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  id = 'openai';
  name = 'OpenAI';

  async generateResponse(prompt: string, financialData: FinancialData): Promise<string> {
    const systemPrompt = this.generateSystemPrompt(financialData);
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || 'No response generated';
  }

  private generateSystemPrompt(data: FinancialData): string {
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return `You are a professional financial advisor with expertise in personal finance management.
    Current financial overview:
    - Total Income: ${formatCurrency(totalIncome, data.currency)}
    - Total Expenses: ${formatCurrency(totalExpenses, data.currency)}
    - Number of Active Budgets: ${data.budgets.length}
    - Total Debt: ${formatCurrency(data.debts.reduce((sum, d) => sum + d.amount, 0), data.currency)}
    - Credit Cards: ${data.creditCards.length}
    - Active Loans: ${data.loans.length}

    Provide personalized financial advice based on this data. Be specific and actionable in your recommendations.`;
  }
}
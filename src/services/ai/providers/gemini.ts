import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, FinancialData } from '../types';
import { formatCurrency } from '../../../utils/formatters';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  id = 'gemini';
  name = 'Gemini';

  async generateResponse(prompt: string, financialData: FinancialData): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    const systemPrompt = this.generateSystemPrompt(financialData);
    
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = result.response;
    
    return response.text();
  }

  private generateSystemPrompt(data: FinancialData): string {
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebt = data.debts.reduce((sum, d) => sum + d.amount, 0);
    const totalCreditCardDebt = data.creditCards.reduce((sum, c) => sum + c.balance, 0);
    const totalLoanBalance = data.loans.reduce((sum, l) => sum + l.currentBalance, 0);

    return `You are an expert financial advisor with deep knowledge in personal finance management.

Current Financial Overview:
- Total Income: ${formatCurrency(totalIncome, data.currency)}
- Total Expenses: ${formatCurrency(totalExpenses, data.currency)}
- Net Income: ${formatCurrency(totalIncome - totalExpenses, data.currency)}
- Total Debt: ${formatCurrency(totalDebt, data.currency)}
- Credit Card Debt: ${formatCurrency(totalCreditCardDebt, data.currency)}
- Loan Balance: ${formatCurrency(totalLoanBalance, data.currency)}
- Active Budgets: ${data.budgets.length}
- Credit Cards: ${data.creditCards.length}
- Active Loans: ${data.loans.length}

Your role is to:
1. Analyze the user's financial situation
2. Provide personalized advice and recommendations
3. Help with budgeting and debt management
4. Suggest strategies for savings and investments
5. Answer questions about financial concepts and best practices

Keep responses clear, actionable, and focused on helping the user improve their financial health.`;
  }
}
import { secureApiClient } from '../../../utils/secureApiClient';
import { secureStorage } from '../../../utils/encryption';
import { formatCurrency } from '../../../utils/formatters';
import { AnthropicMessage, AnthropicResponse } from '../../../types/anthropic';

interface AnthropicConfig {
  apiKey?: string;
  model?: string;
}

export class AnthropicProvider {
  private static instance: AnthropicProvider;
  private model: string;
  private apiKey: string;

  private constructor(config: AnthropicConfig = {}) {
    this.apiKey = config.apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
    this.model = config.model || 'claude-2';
    
    if (!this.apiKey) {
      console.error('Anthropic API key is not set');
    }
  }

  public static getInstance(config?: AnthropicConfig): AnthropicProvider {
    if (!AnthropicProvider.instance) {
      AnthropicProvider.instance = new AnthropicProvider(config);
    }
    return AnthropicProvider.instance;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };
  }

  private constructPrompt(data: any): string {
    const totalIncome = data.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalExpenses = data.transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalDebt = data.debts
      .reduce((sum: number, d: any) => sum + d.amount, 0);

    const totalCreditCardDebt = data.creditCards
      .reduce((sum: number, c: any) => sum + c.balance, 0);

    const totalLoanBalance = data.loans
      .reduce((sum: number, l: any) => sum + l.currentBalance, 0);

    const totalInvestments = data.investments
      .reduce((sum: number, i: any) => sum + i.currentValue, 0);

    return `Please analyze the following financial data and provide comprehensive insights:

Financial Overview:
- Total Income: ${formatCurrency(totalIncome, data.currency)}
- Total Expenses: ${formatCurrency(totalExpenses, data.currency)}
- Net Income: ${formatCurrency(totalIncome - totalExpenses, data.currency)}
- Total Debt: ${formatCurrency(totalDebt, data.currency)}
- Credit Card Debt: ${formatCurrency(totalCreditCardDebt, data.currency)}
- Loan Balance: ${formatCurrency(totalLoanBalance, data.currency)}
- Total Investments: ${formatCurrency(totalInvestments, data.currency)}

Monthly Budget: ${data.userProfile?.monthlyBudgetLimit ? formatCurrency(data.userProfile.monthlyBudgetLimit, data.currency) : 'Not set'}
Monthly Income Target: ${data.userProfile?.monthlyIncomeTarget ? formatCurrency(data.userProfile.monthlyIncomeTarget, data.currency) : 'Not set'}
Savings Goal: ${data.userProfile?.savingsGoal ? formatCurrency(data.userProfile.savingsGoal, data.currency) : 'Not set'}

Please provide:
1. Overall financial health assessment
2. Areas of concern or improvement
3. Specific recommendations for:
   - Budgeting
   - Debt management
   - Savings strategies
   - Investment opportunities
4. Risk assessment
5. Long-term financial planning suggestions
6. Emergency fund recommendations`;
  }

  private constructAdvicePrompt(data: any, specificArea?: string): string {
    let basePrompt = `Based on the following financial data, please provide detailed advice`;
    
    if (specificArea) {
      basePrompt += ` focusing on ${specificArea}`;
    }

    basePrompt += `:\n\n`;

    // Add relevant financial data based on the specific area
    switch (specificArea) {
      case 'debt':
        basePrompt += this.constructDebtAnalysisSection(data);
        break;
      case 'investments':
        basePrompt += this.constructInvestmentAnalysisSection(data);
        break;
      case 'budget':
        basePrompt += this.constructBudgetAnalysisSection(data);
        break;
      default:
        basePrompt += this.constructGeneralFinancialSection(data);
    }

    return basePrompt;
  }

  private constructSpendingAnalysisPrompt(transactions: any[]): string {
    const categorizedSpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc: any, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return `Please analyze these spending patterns and provide insights:

Spending by Category:
${Object.entries(categorizedSpending)
  .map(([category, amount]) => `- ${category}: ${formatCurrency(amount as number, 'PHP')}`)
  .join('\n')}

Please provide:
1. Analysis of spending patterns
2. Unusual or concerning spending trends
3. Categories where spending could be optimized
4. Recommendations for better spending habits
5. Potential savings opportunities`;
  }

  private constructAlertsPrompt(data: any): string {
    const now = new Date();
    const alerts: string[] = [];

    // Check budget
    if (data.userProfile?.monthlyBudgetLimit) {
      const monthlyExpenses = data.transactions
        .filter((t: any) => 
          t.type === 'expense' && 
          new Date(t.date).getMonth() === now.getMonth()
        )
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      if (monthlyExpenses > data.userProfile.monthlyBudgetLimit) {
        alerts.push(`- Over monthly budget by ${formatCurrency(monthlyExpenses - data.userProfile.monthlyBudgetLimit, data.currency)}`);
      }
    }

    // Check credit cards
    data.creditCards.forEach((card: any) => {
      const lastPayment = data.transactions
        .filter((t: any) => 
          t.type === 'expense' && 
          t.category === 'Credit Card Payment' &&
          t.creditCardId === card.id
        )
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!lastPayment || this.daysSince(new Date(lastPayment.date)) > 30) {
        alerts.push(`- No recent payment for credit card: ${card.name}`);
      }
    });

    // Check loans
    data.loans.forEach((loan: any) => {
      if (new Date(loan.nextPaymentDate) < now) {
        alerts.push(`- Overdue loan payment for: ${loan.name}`);
      }
    });

    return `Please analyze these potential issues and provide advice:

Alerts:
${alerts.join('\n')}

Financial Context:
- Monthly Budget: ${data.userProfile?.monthlyBudgetLimit ? formatCurrency(data.userProfile.monthlyBudgetLimit, data.currency) : 'Not set'}
- Total Credit Card Debt: ${formatCurrency(data.creditCards.reduce((sum: number, c: any) => sum + c.balance, 0), data.currency)}
- Total Loan Balance: ${formatCurrency(data.loans.reduce((sum: number, l: any) => sum + l.currentBalance, 0), data.currency)}

Please provide:
1. Analysis of each alert
2. Priority level for each issue
3. Specific recommendations to address each alert
4. Preventive measures for the future
5. Timeline suggestions for resolving these issues`;
  }

  private constructDebtAnalysisSection(data: any): string {
    const totalDebt = data.debts.reduce((sum: number, d: any) => sum + d.amount, 0);
    const totalIncome = data.transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return `Debt Analysis:
- Total Debt: ${formatCurrency(totalDebt, data.currency)}
- Debt-to-Income Ratio: ${((totalDebt / totalIncome) * 100).toFixed(2)}%
- Credit Card Debt: ${formatCurrency(data.creditCards.reduce((sum: number, c: any) => sum + c.balance, 0), data.currency)}
- Loan Balance: ${formatCurrency(data.loans.reduce((sum: number, l: any) => sum + l.currentBalance, 0), data.currency)}

Please provide:
1. Debt reduction strategy
2. Payment prioritization
3. Interest cost analysis
4. Refinancing opportunities
5. Timeline for debt freedom`;
  }

  private constructInvestmentAnalysisSection(data: any): string {
    const totalInvestments = data.investments.reduce((sum: number, i: any) => sum + i.currentValue, 0);
    const totalCost = data.investments.reduce((sum: number, i: any) => sum + (i.purchasePrice * i.quantity), 0);
    const totalReturn = ((totalInvestments - totalCost) / totalCost) * 100;

    return `Investment Analysis:
- Total Investment Value: ${formatCurrency(totalInvestments, data.currency)}
- Total Cost Basis: ${formatCurrency(totalCost, data.currency)}
- Overall Return: ${totalReturn.toFixed(2)}%

Investment Distribution:
${data.investments.map((i: any) => `- ${i.type}: ${formatCurrency(i.currentValue, data.currency)}`).join('\n')}

Please provide:
1. Portfolio analysis
2. Diversification recommendations
3. Risk assessment
4. Rebalancing suggestions
5. New investment opportunities`;
  }

  private constructBudgetAnalysisSection(data: any): string {
    const monthlyIncome = data.transactions
      .filter((t: any) => 
        t.type === 'income' && 
        new Date(t.date).getMonth() === new Date().getMonth()
      )
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const monthlyExpenses = data.transactions
      .filter((t: any) => 
        t.type === 'expense' && 
        new Date(t.date).getMonth() === new Date().getMonth()
      )
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return `Budget Analysis:
- Monthly Income: ${formatCurrency(monthlyIncome, data.currency)}
- Monthly Expenses: ${formatCurrency(monthlyExpenses, data.currency)}
- Net Monthly: ${formatCurrency(monthlyIncome - monthlyExpenses, data.currency)}
- Budget Limit: ${data.userProfile?.monthlyBudgetLimit ? formatCurrency(data.userProfile.monthlyBudgetLimit, data.currency) : 'Not set'}

Expense Categories:
${Object.entries(
  data.transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {})
)
  .map(([category, amount]) => `- ${category}: ${formatCurrency(amount as number, data.currency)}`)
  .join('\n')}

Please provide:
1. Budget optimization suggestions
2. Spending pattern analysis
3. Savings opportunities
4. Category-specific recommendations
5. Monthly targets for each category`;
  }

  private constructGeneralFinancialSection(data: any): string {
    return `Financial Overview:
${this.constructDebtAnalysisSection(data)}

${this.constructInvestmentAnalysisSection(data)}

${this.constructBudgetAnalysisSection(data)}

Please provide comprehensive advice covering:
1. Overall financial health
2. Priority areas for improvement
3. Short-term action items
4. Medium-term goals
5. Long-term strategy
6. Risk management
7. Emergency fund recommendations
8. Lifestyle optimization suggestions`;
  }

  private daysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async generateInsights(data: any) {
    try {
      if (!this.apiKey) {
        throw new Error('Anthropic API key is not configured');
      }

      const prompt = this.constructPrompt(data);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.content[0].text;
    } catch (error) {
      console.error('Error generating insights with Anthropic:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate insights');
    }
  }

  async getFinancialAdvice(data: any, specificArea?: string) {
    try {
      if (!this.apiKey) {
        throw new Error('Anthropic API key is not configured');
      }

      const prompt = this.constructAdvicePrompt(data, specificArea);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.content[0].text;
    } catch (error) {
      console.error('Error getting financial advice with Anthropic:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get financial advice');
    }
  }

  async analyzeSpendingPatterns(transactions: any[]) {
    try {
      if (!this.apiKey) {
        throw new Error('Anthropic API key is not configured');
      }

      const prompt = this.constructSpendingAnalysisPrompt(transactions);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.content[0].text;
    } catch (error) {
      console.error('Error analyzing spending patterns with Anthropic:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze spending patterns');
    }
  }

  async getAlerts(data: any) {
    try {
      if (!this.apiKey) {
        throw new Error('Anthropic API key is not configured');
      }

      const prompt = this.constructAlertsPrompt(data);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.content[0].text;
    } catch (error) {
      console.error('Error getting alerts with Anthropic:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get alerts');
    }
  }
}

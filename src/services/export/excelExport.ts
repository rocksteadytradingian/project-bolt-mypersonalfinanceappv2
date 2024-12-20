import { 
  Transaction, 
  FundSource, 
  CreditCard, 
  Loan, 
  Debt, 
  Investment 
} from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const exportTransactions = (transactions: Transaction[]) => {
  const headers = [
    'Date',
    'Type',
    'Category',
    'Details',
    'Amount',
    'Payment Method',
    'From',
    'To'
  ];

  const data = transactions.map(t => [
    formatDate(t.date),
    t.type,
    t.category,
    t.details,
    formatCurrency(t.amount),
    t.paymentMethod || '',
    t.from || '',
    t.to || ''
  ]);

  return [headers, ...data];
};

export const exportFundSources = (sources: FundSource[]) => {
  const headers = [
    'Name',
    'Bank',
    'Account Name',
    'Account Type',
    'Type',
    'Balance',
    'Last Updated'
  ];

  const data = sources.map(s => [
    s.name,
    s.bankName,
    s.accountName,
    s.accountType,
    s.type,
    formatCurrency(s.balance),
    s.lastUpdated ? formatDate(s.lastUpdated) : ''
  ]);

  return [headers, ...data];
};

export const exportCreditCards = (cards: CreditCard[]) => {
  const headers = [
    'Name',
    'Bank',
    'Limit',
    'Balance',
    'APR',
    'Due Date',
    'Cut-off Date',
    'Minimum Payment'
  ];

  const data = cards.map(c => [
    c.name,
    c.bank,
    formatCurrency(c.limit),
    formatCurrency(c.balance),
    `${c.apr}%`,
    formatDate(c.dueDate),
    formatDate(c.cutOffDate),
    formatCurrency(c.minimumPayment)
  ]);

  return [headers, ...data];
};

export const exportLoans = (loans: Loan[]) => {
  const headers = [
    'Name',
    'Lender',
    'Type',
    'Original Amount',
    'Current Balance',
    'Interest Rate',
    'Start Date',
    'End Date',
    'Monthly Payment',
    'Status'
  ];

  const data = loans.map(l => [
    l.name,
    l.lender,
    l.type,
    formatCurrency(l.originalAmount),
    formatCurrency(l.currentBalance),
    `${l.interestRate}%`,
    formatDate(l.startDate),
    formatDate(l.endDate),
    formatCurrency(l.monthlyPayment),
    l.status
  ]);

  return [headers, ...data];
};

export const exportDebts = (debts: Debt[]) => {
  const headers = [
    'Name',
    'Type',
    'Amount',
    'Balance',
    'Interest Rate',
    'Minimum Payment',
    'Due Date'
  ];

  const data = debts.map(d => [
    d.name,
    d.type,
    formatCurrency(d.amount),
    formatCurrency(d.balance),
    `${d.interestRate}%`,
    formatCurrency(d.minimumPayment),
    formatDate(d.dueDate)
  ]);

  return [headers, ...data];
};

export const exportInvestments = (investments: Investment[]) => {
  const headers = [
    'Name',
    'Type',
    'Category',
    'Amount',
    'Current Value',
    'Purchase Date',
    'Purchase Price',
    'Quantity',
    'Platform',
    'Risk Level',
    'Status',
    'Expected Return',
    'Maturity Date'
  ];

  const data = investments.map(i => [
    i.name,
    i.type,
    i.category,
    formatCurrency(i.amount),
    formatCurrency(i.currentValue),
    formatDate(i.purchaseDate),
    formatCurrency(i.purchasePrice),
    i.quantity,
    i.platform,
    i.riskLevel,
    i.status,
    `${i.expectedReturn}%`,
    i.maturityDate ? formatDate(i.maturityDate) : ''
  ]);

  return [headers, ...data];
};

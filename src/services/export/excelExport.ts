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

const formatDayOfMonth = (day: number) => {
  return `${day}${getDaySuffix(day)}`;
};

const getDaySuffix = (day: number) => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
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
    'Bank Name',
    'Account Name',
    'Account Type',
    'Current Balance',
    'Monthly Flow',
    'Last Updated',
    'Transactions'
  ];

  const data = sources.map(s => [
    s.bankName,
    s.accountName,
    s.accountType,
    formatCurrency(s.currentBalance),
    formatCurrency(s.monthlyFlow || 0),
    s.lastUpdated ? formatDate(s.lastUpdated) : '',
    s.transactions.length.toString()
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
    formatDayOfMonth(c.dueDate),
    formatDayOfMonth(c.cutOffDate),
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

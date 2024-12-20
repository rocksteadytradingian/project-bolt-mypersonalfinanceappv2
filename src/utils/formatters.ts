import { useFinanceStore } from '../store/useFinanceStore';

export const formatCurrency = (amount: number, currency?: string): string => {
  const defaultCurrency = useFinanceStore.getState().userProfile?.currency || 'USD';
  const currencyToUse = currency || defaultCurrency;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyToUse,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (value: string): string => {
  // Remove any non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    parts.splice(2, parts.length - 2);
  }
  
  // Format the whole number part with commas
  let wholeNumber = parts[0];
  wholeNumber = wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Reconstruct with decimal part if it exists
  if (parts.length === 2) {
    // Limit decimal places to 2
    return `${wholeNumber}.${parts[1].slice(0, 2)}`;
  }
  
  return wholeNumber;
};

export const parseFormattedNumber = (value: string): number => {
  // Remove commas and convert to number
  return Number(value.replace(/,/g, ''));
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(dateObj);
};

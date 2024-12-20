import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Transaction, TransactionType } from '../types/finance';
import { Card } from './ui/Card';
import { TransactionFilters } from './TransactionFilters';
import { TransactionTable } from './TransactionTable';
import { TransactionSummary } from './TransactionSummary';

export function TransactionRecords() {
  const transactions = useFinanceStore((state) => state.transactions);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '' as TransactionType | '',
    category: '',
    minAmount: '',
    maxAmount: '',
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return (
        (!filters.startDate || date >= new Date(filters.startDate)) &&
        (!filters.endDate || date <= new Date(filters.endDate)) &&
        (!filters.type || transaction.type === filters.type) &&
        (!filters.category || transaction.category === filters.category) &&
        (!filters.minAmount || transaction.amount >= Number(filters.minAmount)) &&
        (!filters.maxAmount || transaction.amount <= Number(filters.maxAmount))
      );
    });
  }, [transactions, filters]);

  return (
    <div className="space-y-6">
      <TransactionSummary transactions={filteredTransactions} />
      
      <Card>
        <h2 className="text-xl font-semibold mb-4">Transaction Records</h2>
        <TransactionFilters filters={filters} onFilterChange={setFilters} />
        <TransactionTable transactions={filteredTransactions} />
      </Card>
    </div>
  );
}
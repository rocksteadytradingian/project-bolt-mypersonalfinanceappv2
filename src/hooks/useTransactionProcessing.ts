import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types/finance';
import { addTransaction, updateTransaction, deleteTransaction } from '../services/transactions/transactionService';
import { useAuth } from '../contexts/AuthContext';

export const useTransactionProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!currentUser) {
      setError('User must be logged in to add transactions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addTransaction(transaction, currentUser.uid);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    if (!currentUser) {
      setError('User must be logged in to update transactions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateTransaction(transaction.id, transaction, currentUser.uid);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!currentUser) {
      setError('User must be logged in to delete transactions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteTransaction(transactionId, currentUser.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the transaction');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction
  };
};

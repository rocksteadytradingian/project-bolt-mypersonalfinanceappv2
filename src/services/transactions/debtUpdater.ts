import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const updateDebtBalance = async (debtId: string, amount: number): Promise<void> => {
  try {
    const debtRef = doc(db, 'debts', debtId);
    await updateDoc(debtRef, {
      balance: amount,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating debt balance:', error);
    throw error;
  }
};

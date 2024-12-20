import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const updateLoanBalance = async (loanId: string, amount: number): Promise<void> => {
  try {
    const loanRef = doc(db, 'loans', loanId);
    await updateDoc(loanRef, {
      balance: amount,
      currentBalance: amount,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating loan balance:', error);
    throw error;
  }
};

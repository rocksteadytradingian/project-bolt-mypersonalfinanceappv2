import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const updateFundSourceBalance = async (fundSourceId: string, amount: number): Promise<void> => {
  try {
    const fundSourceRef = doc(db, 'fundSources', fundSourceId);
    await updateDoc(fundSourceRef, {
      balance: amount,
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating fund source balance:', error);
    throw error;
  }
};

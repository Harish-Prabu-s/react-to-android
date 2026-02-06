import apiClient from './client';
import type { Wallet, CoinTransaction, PaginatedResponse } from '@/types';

export const walletApi = {
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get('/wallet/');
    return response.data;
  },

  getTransactions: async (): Promise<PaginatedResponse<CoinTransaction>> => {
    const response = await apiClient.get('/wallet/transactions/');
    return response.data;
  },
  
  purchase: async (amount: number, coins: number): Promise<{ success: boolean; payment_id: number }> => {
    const response = await apiClient.post('/wallet/purchase/', { amount, coins });
    return response.data;
  },
};

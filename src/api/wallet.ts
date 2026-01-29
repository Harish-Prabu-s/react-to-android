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
};

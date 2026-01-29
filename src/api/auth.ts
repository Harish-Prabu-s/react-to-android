import apiClient from './client';
import type { OTPRequest, AuthResponse, GenderSelection, User } from '@/types';

interface OTPResponse {
  message: string;
  otp?: string; // Only in development
}

export const authApi = {
  sendOTP: async (data: OTPRequest): Promise<OTPResponse> => {
    const response = await apiClient.post('/auth/send-otp/', data);
    return response.data;
  },

  verifyOTP: async (data: { phone_number: string; otp_code: string }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-otp/', data);
    return response.data;
  },

  selectGender: async (data: GenderSelection): Promise<User> => {
    const response = await apiClient.patch('/auth/update-gender/', data);
    return response.data;
  },

  getUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await apiClient.post('/auth/logout/', { refresh: refreshToken });
    }
  },
};

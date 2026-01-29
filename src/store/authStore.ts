import { create } from 'zustand';
import { authApi } from '@/api/auth';
import type { User, Gender } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (phoneNumber: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  selectGender: (gender: Gender) => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (phoneNumber: string, otpCode: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.verifyOTP({
        phone_number: phoneNumber,
        otp_code: otpCode,
      });

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  selectGender: async (gender: Gender) => {
    set({ isLoading: true });
    try {
      const updatedUser = await authApi.selectGender({ gender });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const user = await authApi.getUser();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

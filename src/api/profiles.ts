import apiClient from './client';
import type { Profile } from '@/types';

export const profilesApi = {
  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/profiles/me/');
    return response.data;
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await apiClient.patch('/profiles/me/', data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<Profile> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiClient.patch('/profiles/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

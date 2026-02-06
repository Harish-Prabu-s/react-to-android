import apiClient from './client';
import type { Story } from '@/types';

export const storiesApi = {
  list: async (): Promise<Story[]> => {
    const res = await apiClient.get('/stories/');
    return res.data;
  },
  create: async (image_url: string): Promise<Story> => {
    const res = await apiClient.post('/stories/create/', { image_url });
    return res.data;
  },
  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('media', file);
    const res = await apiClient.post('/stories/upload/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

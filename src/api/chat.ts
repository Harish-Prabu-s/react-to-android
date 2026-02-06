import apiClient from './client';
import type { Room, Message } from '@/types';

export const chatApi = {
  createRoom: async (receiver_id: number, call_type: 'audio' | 'video' = 'audio'): Promise<Room> => {
    const res = await apiClient.post('/chat/rooms/create/', { receiver_id, call_type });
    return res.data;
  },
  getRooms: async (): Promise<Room[]> => {
    const res = await apiClient.get('/chat/rooms/');
    return res.data;
  },
  getMessages: async (room_id: number): Promise<Message[]> => {
    const res = await apiClient.get(`/chat/messages/${room_id}/`);
    return res.data;
  },
  sendMessage: async (room_id: number, content: string, type: 'text' | 'image' | 'audio' = 'text', media_url?: string, duration_seconds?: number): Promise<Message> => {
    const res = await apiClient.post(`/chat/messages/${room_id}/send/`, { content, type, media_url, duration_seconds });
    return res.data;
  },
  getPresence: async (user_id: number): Promise<{ status: 'busy' | 'active' }> => {
    const res = await apiClient.get(`/chat/presence/${user_id}/`);
    return res.data;
  },
};

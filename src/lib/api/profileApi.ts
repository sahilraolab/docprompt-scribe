// src/lib/api/profileApi.ts
import { apiClient } from './client';

export const profileApi = {
  getProfile: () => apiClient.request('/profile'),
  updateProfile: (data: any) =>
    apiClient.request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.request('/profile/password', { method: 'PUT', body: JSON.stringify(data) }),
  updateNotifications: (data: any) =>
    apiClient.request('/profile/notifications', { method: 'PUT', body: JSON.stringify(data) }),
};

// src/lib/api/profileApi.ts
import { apiClient } from './client';

const AUTH_BASE = '/auth';

export const profileApi = {
  getProfile: () => apiClient.request(`${AUTH_BASE}/me`),
  updateProfile: (data: any) =>
    apiClient.request(`${AUTH_BASE}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.request(`${AUTH_BASE}/change-password`, { method: 'POST', body: JSON.stringify(data) }),
  updateNotifications: (data: any) =>
    apiClient.request(`${AUTH_BASE}/notifications`, { method: 'PUT', body: JSON.stringify(data) }),
};

// src/lib/api/authApi.ts
import { apiClient, setClientToken } from './client';

const AUTH_BASE = '/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const result = await apiClient.request(`${AUTH_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // Handle both { token } and { accessToken } formats
    const authToken = result.token || result.accessToken || result.data?.token || result.data?.accessToken;
    if (authToken) {
      setClientToken(authToken);
    }
    return result;
  },

  register: async (data: RegisterData) => {
    const result = await apiClient.request(`${AUTH_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  },

  logout: async () => {
    try {
      await apiClient.request(`${AUTH_BASE}/logout`, { method: 'POST' });
    } finally {
      setClientToken(null);
    }
  },

  refreshToken: async () => {
    const result = await apiClient.request(`${AUTH_BASE}/refresh`, {
      method: 'POST',
    });
    // Handle both { token } and { accessToken } formats
    const authToken = result.token || result.accessToken || result.data?.token || result.data?.accessToken;
    if (authToken) {
      setClientToken(authToken);
    }
    return result;
  },

  getProfile: () => apiClient.request(`${AUTH_BASE}/me`),

  forgotPassword: (email: string) =>
    apiClient.request(`${AUTH_BASE}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.request(`${AUTH_BASE}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.request(`${AUTH_BASE}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

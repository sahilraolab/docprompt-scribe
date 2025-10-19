// Centralized API client with automatic token refresh

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
const TOKEN_KEY = 'erp_auth_token';

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && data?.accessToken) {
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export const apiClient = {
  API_URL,
  async request(endpoint: string, options: RequestInit = {}, retry = true): Promise<Response> {
    const token = localStorage.getItem(TOKEN_KEY);

    const isFormData = (options as any)?.body instanceof FormData;

    const res = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 401 && retry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // retry once with new token
        return this.request(endpoint, options, false);
      }
    }

    return res;
  },
};

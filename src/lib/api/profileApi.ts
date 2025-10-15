const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

async function apiCall(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('erp_auth_token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed');
  }

  return result;
}

export const profileApi = {
  getProfile: () => apiCall('/profile'),
  updateProfile: (data: any) => apiCall('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiCall('/profile/password', { method: 'PUT', body: JSON.stringify(data) }),
};

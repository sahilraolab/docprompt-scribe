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

  return result; // Return full { success, data, message } structure
}

export const userApi = {
  getAll: () => apiCall('/users'),
  getById: (id: string) => apiCall(`/users/${id}`),
  create: (data: any) => apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/users/${id}`, { method: 'DELETE' }),
};

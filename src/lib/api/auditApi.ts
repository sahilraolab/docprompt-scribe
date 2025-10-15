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

export const auditApi = {
  getAll: (params?: { module?: string; action?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiCall(`/audit-trail${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiCall(`/audit-trail/${id}`),
};

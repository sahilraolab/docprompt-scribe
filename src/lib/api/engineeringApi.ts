const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

// Helper function for API calls
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

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Projects API
export const projectsApi = {
  getAll: () => apiCall('/engineering/projects'),
  getById: (id: string) => apiCall(`/engineering/projects/${id}`),
  create: (data: any) => apiCall('/engineering/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/projects/${id}`, { method: 'DELETE' }),
};

// Estimates API
export const estimatesApi = {
  getAll: () => apiCall('/engineering/estimates'),
  getById: (id: string) => apiCall(`/engineering/estimates/${id}`),
  getByProject: (projectId: string) => apiCall(`/engineering/estimates?projectId=${projectId}`),
  create: (data: any) => apiCall('/engineering/estimates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/estimates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/estimates/${id}`, { method: 'DELETE' }),
  submit: (id: string) => apiCall(`/engineering/estimates/${id}/submit`, { method: 'POST' }),
  approve: (id: string, data?: any) => apiCall(`/engineering/estimates/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  reject: (id: string, data?: any) => apiCall(`/engineering/estimates/${id}/reject`, { method: 'POST', body: JSON.stringify(data || {}) }),
};

// Documents API
export const documentsApi = {
  getAll: () => apiCall('/engineering/documents'),
  getById: (id: string) => apiCall(`/engineering/documents/${id}`),
  getByProject: (projectId: string) => apiCall(`/engineering/documents?projectId=${projectId}`),
  create: (data: any) => apiCall('/engineering/documents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/documents/${id}`, { method: 'DELETE' }),
};

// Plans API
export const plansApi = {
  getAll: () => apiCall('/engineering/plans'),
  getById: (id: string) => apiCall(`/engineering/plans/${id}`),
  getByProject: (projectId: string) => apiCall(`/engineering/plans?projectId=${projectId}`),
  create: (data: any) => apiCall('/engineering/plans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/plans/${id}`, { method: 'DELETE' }),
};

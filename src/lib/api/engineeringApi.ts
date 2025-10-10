const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('authToken');
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
  getAll: () => apiCall('/projects'),
  getById: (id: string) => apiCall(`/projects/${id}`),
  create: (data: any) => apiCall('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/projects/${id}`, { method: 'DELETE' }),
};

// Estimates API
export const estimatesApi = {
  getAll: () => apiCall('/estimates'),
  getById: (id: string) => apiCall(`/estimates/${id}`),
  getByProject: (projectId: string) => apiCall(`/estimates?projectId=${projectId}`),
  create: (data: any) => apiCall('/estimates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/estimates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/estimates/${id}`, { method: 'DELETE' }),
  submit: (id: string) => apiCall(`/estimates/${id}/submit`, { method: 'POST' }),
  approve: (id: string, data?: any) => apiCall(`/estimates/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  reject: (id: string, data?: any) => apiCall(`/estimates/${id}/reject`, { method: 'POST', body: JSON.stringify(data || {}) }),
};

// Documents API
export const documentsApi = {
  getAll: () => apiCall('/documents'),
  getById: (id: string) => apiCall(`/documents/${id}`),
  getByProject: (projectId: string) => apiCall(`/documents?projectId=${projectId}`),
  create: async (data: FormData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: data,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },
  update: (id: string, data: any) => apiCall(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/documents/${id}`, { method: 'DELETE' }),
};

// Plans API
export const plansApi = {
  getAll: () => apiCall('/plans'),
  getById: (id: string) => apiCall(`/plans/${id}`),
  getByProject: (projectId: string) => apiCall(`/plans?projectId=${projectId}`),
  create: (data: any) => apiCall('/plans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/plans/${id}`, { method: 'DELETE' }),
};

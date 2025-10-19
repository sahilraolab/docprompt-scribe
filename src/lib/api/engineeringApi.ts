import { apiClient } from './client';

// Helper function for API calls matching backend { success, data, message } format
async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await apiClient.request(endpoint, options);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed');
  }

  return result; // Return full { success, data, message } structure
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
  create: async (data: FormData) => {
    const response = await apiClient.request('/engineering/documents', {
      method: 'POST',
      body: data as any,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Upload failed');
    }
    return result; // Return full { success, data, message } structure
  },
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

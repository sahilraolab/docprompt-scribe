import { apiClient } from './client';

// Helper function for API calls matching backend { success, data, message } format
async function apiCall(endpoint: string, options?: RequestInit) {
  const result = await apiClient.request(endpoint, options);

  if (!result?.success) {
    throw new Error(result?.message || 'Request failed');
  }

  return result; // { success, data, message }
}

// Budget API (matches backend routes)
export const budgetApi = {
  getByProject: (projectId: string) => apiCall(`/engineering/budget/${projectId}`),
  create: (data: any) => apiCall('/engineering/budget', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) => apiCall(`/engineering/budget/${id}/approve`, { method: 'PUT' }),
};

// Estimates API (matches backend routes)
export const estimatesApi = {
  getAll: (projectId?: string) => apiCall(projectId ? `/engineering/estimate?projectId=${projectId}` : '/engineering/estimate'),
  getById: (id: string) => apiCall(`/engineering/estimate/${id}`),
  getByProject: (projectId: string) => apiCall(`/engineering/estimate?projectId=${projectId}`),
  create: (data: any) => apiCall('/engineering/estimate', { method: 'POST', body: JSON.stringify(data) }),
  addVersion: (data: any) => apiCall('/engineering/estimate/version', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) => apiCall(`/engineering/estimate/${id}/approve`, { method: 'PUT' }),
};

// BBS API (matches backend routes)
export const bbsApi = {
  getAll: (projectId?: string) => apiCall(projectId ? `/engineering/bbs?projectId=${projectId}` : '/engineering/bbs'),
  getById: (id: string) => apiCall(`/engineering/bbs/${id}`),
  create: (data: any) => apiCall('/engineering/bbs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/bbs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/bbs/${id}`, { method: 'DELETE' }),
};

// Drawings API (matches backend routes)
export const drawingsApi = {
  getAll: (projectId?: string) => apiCall(projectId ? `/engineering/drawings?projectId=${projectId}` : '/engineering/drawings'),
  getById: (id: string) => apiCall(`/engineering/drawings/${id}`),
  create: (data: any) => apiCall('/engineering/drawings', { method: 'POST', body: JSON.stringify(data) }),
  revise: (data: any) => apiCall('/engineering/drawings/revision', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) => apiCall(`/engineering/drawings/${id}/approve`, { method: 'PUT' }),
};

// Compliance API (matches backend routes)
export const complianceApi = {
  getAll: (projectId?: string) => apiCall(projectId ? `/engineering/compliance?projectId=${projectId}` : '/engineering/compliance'),
  getById: (id: string) => apiCall(`/engineering/compliance/${id}`),
  create: (data: any) => apiCall('/engineering/compliance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/compliance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/compliance/${id}`, { method: 'DELETE' }),
};

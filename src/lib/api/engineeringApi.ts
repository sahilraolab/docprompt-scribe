import { apiClient } from './client';

// Helper function for API calls matching backend { success, data, message } format
async function apiCall(endpoint: string, options?: RequestInit) {
  const result = await apiClient.request(endpoint, options);

  if (!result?.success) {
    throw new Error(result?.message || 'Request failed');
  }

  return result; // { success, data, message }
}

// ==================== BUDGET API ====================
// Backend: POST /engineering/budget, PUT /engineering/budget/:id/approve, GET /engineering/budget/:projectId
export const budgetApi = {
  getAll: () => apiCall('/engineering/budget'),
  getByProject: (projectId: string) => apiCall(`/engineering/budget/${projectId}`),
  create: (data: { projectId: number; totalBudget: number }) => 
    apiCall('/engineering/budget', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) => 
    apiCall(`/engineering/budget/${id}/approve`, { method: 'PUT' }),
};

// ==================== ESTIMATES API ====================
// Backend: POST /engineering/estimate, POST /engineering/estimate/version, PUT /engineering/estimate/:id/approve, GET /engineering/estimate?projectId=
export const estimatesApi = {
  getAll: (projectId?: string) => 
    apiCall(projectId ? `/engineering/estimate?projectId=${projectId}` : '/engineering/estimate'),
  getById: (id: string) => apiCall(`/engineering/estimate/${id}`),
  getByProject: (projectId: string) => apiCall(`/engineering/estimate?projectId=${projectId}`),
  create: (data: { projectId: number; name: string; baseAmount: number }) => 
    apiCall('/engineering/estimate', { method: 'POST', body: JSON.stringify(data) }),
  addVersion: (data: { estimateId: number; versionNo: number; amount: number }) => 
    apiCall('/engineering/estimate/version', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) => 
    apiCall(`/engineering/estimate/${id}/approve`, { method: 'PUT' }),
};

// ==================== BBS API ====================
// Backend: POST /engineering/bbs, GET /engineering/bbs?projectId=
export const bbsApi = {
  getAll: (projectId?: string) => 
    apiCall(projectId ? `/engineering/bbs?projectId=${projectId}` : '/engineering/bbs'),
  getById: (id: string) => apiCall(`/engineering/bbs/${id}`),
  create: (data: { projectId: number; code: string; description?: string; quantity: number; uomId: number; rate: number }) => 
    apiCall('/engineering/bbs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => 
    apiCall(`/engineering/bbs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/bbs/${id}`, { method: 'DELETE' }),
  approve: (id: string) => 
    apiCall(`/engineering/bbs/${id}/approve`, { method: 'PUT' }),
};

// ==================== DRAWINGS API ====================
// Backend: POST /engineering/drawings, POST /engineering/drawings/revision, PUT /engineering/drawings/:id/approve
export const drawingsApi = {
  getAll: (projectId?: string) => 
    apiCall(projectId ? `/engineering/drawings?projectId=${projectId}` : '/engineering/drawings'),
  getById: (id: string) => apiCall(`/engineering/drawings/${id}`),
  create: (data: { projectId: number; title: string; drawingNo: string; discipline: string }) => 
    apiCall('/engineering/drawings', { method: 'POST', body: JSON.stringify(data) }),
  revise: (data: { drawingId: number; revisionNo: string; changeNote?: string }) => 
    apiCall('/engineering/drawings/revision', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) => 
    apiCall(`/engineering/drawings/${id}/approve`, { method: 'PUT' }),
};

// ==================== COMPLIANCE API ====================
// Backend: POST /engineering/compliance
export const complianceApi = {
  getAll: (projectId?: string) => 
    apiCall(projectId ? `/engineering/compliance?projectId=${projectId}` : '/engineering/compliance'),
  getById: (id: string) => apiCall(`/engineering/compliance/${id}`),
  create: (data: { projectId: number; type: string; documentRef?: string; validTill?: string }) => 
    apiCall('/engineering/compliance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => 
    apiCall(`/engineering/compliance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/compliance/${id}`, { method: 'DELETE' }),
};

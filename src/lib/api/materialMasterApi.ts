const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

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

// Material Master API (Shared across Engineering & Purchase)
export const materialMasterApi = {
  getAll: () => apiCall('/engineering/materials'),
  getById: (id: string) => apiCall(`/engineering/materials/${id}`),
  getByCategory: (category: string) => apiCall(`/engineering/materials?category=${category}`),
  create: (data: any) => apiCall('/engineering/materials', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/materials/${id}`, { method: 'DELETE' }),
  search: (query: string) => apiCall(`/engineering/materials/search?q=${encodeURIComponent(query)}`),
};

// BOQ API
export const boqApi = {
  getAll: () => apiCall('/engineering/boq'),
  getById: (id: string) => apiCall(`/engineering/boq/${id}`),
  getByProject: (projectId: string) => apiCall(`/engineering/boq?projectId=${projectId}`),
  getByEstimate: (estimateId: string) => apiCall(`/engineering/boq?estimateId=${estimateId}`),
  create: (data: any) => apiCall('/engineering/boq', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/engineering/boq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/engineering/boq/${id}`, { method: 'DELETE' }),
  generateFromEstimate: (estimateId: string) => apiCall(`/engineering/boq/generate/${estimateId}`, { method: 'POST' }),
  approve: (id: string) => apiCall(`/engineering/boq/${id}/approve`, { method: 'POST' }),
};

// Material Requisition from BOQ
export const mrFromBOQApi = {
  generateFromBOQ: (boqId: string, data: any) => apiCall(`/purchase/mrs/from-boq/${boqId}`, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  getMRsByBOQ: (boqId: string) => apiCall(`/purchase/mrs?boqId=${boqId}`),
};

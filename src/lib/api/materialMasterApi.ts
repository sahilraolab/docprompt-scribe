const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Material Master API (Shared across Engineering & Purchase)
export const materialMasterApi = {
  getAll: () => apiCall('/materials'),
  getById: (id: string) => apiCall(`/materials/${id}`),
  getByCategory: (category: string) => apiCall(`/materials?category=${category}`),
  create: (data: any) => apiCall('/materials', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/materials/${id}`, { method: 'DELETE' }),
  search: (query: string) => apiCall(`/materials/search?q=${encodeURIComponent(query)}`),
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

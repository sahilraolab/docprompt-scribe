import { apiClient } from './client';

const MASTERS_BASE = '/masters';
const ENGINEERING_BASE = '/engineering';

// Material Master API (Shared across Engineering & Purchase)
export const materialMasterApi = {
  getAll: () => apiClient.request(`${MASTERS_BASE}/materials`),
  getById: (id: string) => apiClient.request(`${MASTERS_BASE}/materials/${id}`),
  getByCategory: (category: string) => apiClient.request(`${MASTERS_BASE}/materials?category=${category}`),
  create: (data: any) => apiClient.request(`${MASTERS_BASE}/materials`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient.request(`${MASTERS_BASE}/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient.request(`${MASTERS_BASE}/materials/${id}`, { method: 'DELETE' }),
  search: (query: string) => apiClient.request(`${MASTERS_BASE}/materials/search?q=${encodeURIComponent(query)}`),
};

// BOQ API
export const boqApi = {
  getAll: () => apiClient.request(`${ENGINEERING_BASE}/boq`),
  getById: (id: string) => apiClient.request(`${ENGINEERING_BASE}/boq/${id}`),
  getByProject: (projectId: string) => apiClient.request(`${ENGINEERING_BASE}/boq?projectId=${projectId}`),
  getByEstimate: (estimateId: string) => apiClient.request(`${ENGINEERING_BASE}/boq?estimateId=${estimateId}`),
  create: (data: any) => apiClient.request(`${ENGINEERING_BASE}/boq`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient.request(`${ENGINEERING_BASE}/boq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient.request(`${ENGINEERING_BASE}/boq/${id}`, { method: 'DELETE' }),
  generateFromEstimate: (estimateId: string) => apiClient.request(`${ENGINEERING_BASE}/boq/generate/${estimateId}`, { method: 'POST' }),
  approve: (id: string) => apiClient.request(`${ENGINEERING_BASE}/boq/${id}/approve`, { method: 'POST' }),
};

// Material Requisition from BOQ
export const mrFromBOQApi = {
  generateFromBOQ: (boqId: string, data: any) =>
    apiClient.request(`${ENGINEERING_BASE}/boq/${boqId}/generate-mr`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMRsByBOQ: (boqId: string) =>
    apiClient.request(`/purchase/mrs?boqId=${boqId}`),
};

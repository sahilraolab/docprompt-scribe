import { apiClient } from './client';

const CONTRACTS_BASE = '/contracts';

// =============== CONTRACTORS =====================
export const contractorsApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.request(`${CONTRACTS_BASE}/contractors${queryString}`, { method: 'GET' });
  },
  getById: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/contractors/${id}`, { method: 'GET' });
  },
  create: (payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/contractors`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update: (id: string, payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/contractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  delete: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/contractors/${id}`, { method: 'DELETE' });
  },
};

// =============== LABOUR RATES =====================
export const labourRatesApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.request(`${CONTRACTS_BASE}/labour-rates${queryString}`, { method: 'GET' });
  },
  getById: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/labour-rates/${id}`, { method: 'GET' });
  },
  create: (payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/labour-rates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update: (id: string, payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/labour-rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  delete: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/labour-rates/${id}`, { method: 'DELETE' });
  },
};

// =============== WORK ORDERS =====================
export const workOrdersApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.request(`${CONTRACTS_BASE}/work-orders${queryString}`, { method: 'GET' });
  },
  getById: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/work-orders/${id}`, { method: 'GET' });
  },
  getItems: (workOrderId: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/work-orders/${workOrderId}/items`, {
      method: 'GET',
    });
  },
  create: (payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/work-orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update: (id: string, payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  approve: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/work-orders/${id}/approve`, { method: 'POST' });
  },
};

// =============== RA BILLS =====================
export const raBillsApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.request(`${CONTRACTS_BASE}/ra-bills${queryString}`, { method: 'GET' });
  },
  getById: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/ra-bills/${id}`, { method: 'GET' });
  },
  create: (payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/ra-bills`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update: (id: string, payload: any) => {
    return apiClient.request(`${CONTRACTS_BASE}/ra-bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  approve: (id: string) => {
    return apiClient.request(`${CONTRACTS_BASE}/ra-bills/${id}/approve`, { method: 'POST' });
  },
};

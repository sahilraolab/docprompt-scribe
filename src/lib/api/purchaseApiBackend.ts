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

// Material Requisitions API
export const mrsApi = {
  getAll: () => apiCall('/purchase/mrs'),
  getById: (id: string) => apiCall(`/purchase/mrs/${id}`),
  create: (data: any) => apiCall('/purchase/mrs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/mrs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/mrs/${id}`, { method: 'DELETE' }),
  submit: (id: string) => apiCall(`/purchase/mrs/${id}/submit`, { method: 'POST' }),
  approve: (id: string, data?: any) => apiCall(`/purchase/mrs/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  reject: (id: string, data?: any) => apiCall(`/purchase/mrs/${id}/reject`, { method: 'POST', body: JSON.stringify(data || {}) }),
};

// Quotations API
export const quotationsApi = {
  getAll: () => apiCall('/purchase/quotations'),
  getById: (id: string) => apiCall(`/purchase/quotations/${id}`),
  getByMR: (mrId: string) => apiCall(`/purchase/quotations?mrId=${mrId}`),
  create: (data: any) => apiCall('/purchase/quotations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/quotations/${id}`, { method: 'DELETE' }),
};

// Comparative Statements API
export const csApi = {
  getAll: () => apiCall('/purchase/comparative'),
  getById: (id: string) => apiCall(`/purchase/comparative/${id}`),
  create: (data: any) => apiCall('/purchase/comparative', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/comparative/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/comparative/${id}`, { method: 'DELETE' }),
  selectSupplier: (id: string, supplierId: string) => 
    apiCall(`/purchase/comparative/${id}/select-supplier`, { 
      method: 'POST', 
      body: JSON.stringify({ supplierId }) 
    }),
};

// Purchase Orders API
export const posApi = {
  getAll: () => apiCall('/purchase/po'),
  getById: (id: string) => apiCall(`/purchase/po/${id}`),
  create: (data: any) => apiCall('/purchase/po', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/po/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/po/${id}`, { method: 'DELETE' }),
  submit: (id: string) => apiCall(`/purchase/po/${id}/submit`, { method: 'POST' }),
  approve: (id: string, data?: any) => apiCall(`/purchase/po/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  reject: (id: string, data?: any) => apiCall(`/purchase/po/${id}/reject`, { method: 'POST', body: JSON.stringify(data || {}) }),
};

// Purchase Bills API
export const purchaseBillsApi = {
  getAll: () => apiCall('/purchase/bills'),
  getById: (id: string) => apiCall(`/purchase/bills/${id}`),
  getByPO: (poId: string) => apiCall(`/purchase/bills?poId=${poId}`),
  create: (data: any) => apiCall('/purchase/bills', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/bills/${id}`, { method: 'DELETE' }),
};

// Items API
export const itemsApi = {
  getAll: () => apiCall('/items'),
  getById: (id: string) => apiCall(`/items/${id}`),
  create: (data: any) => apiCall('/items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/items/${id}`, { method: 'DELETE' }),
};

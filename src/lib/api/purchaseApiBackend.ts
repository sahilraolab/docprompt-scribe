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

// Material Requisitions API
export const mrsApi = {
  getAll: () => apiCall('/mrs'),
  getById: (id: string) => apiCall(`/mrs/${id}`),
  create: (data: any) => apiCall('/mrs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/mrs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/mrs/${id}`, { method: 'DELETE' }),
  submit: (id: string) => apiCall(`/mrs/${id}/submit`, { method: 'POST' }),
  approve: (id: string, data?: any) => apiCall(`/mrs/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  reject: (id: string, data?: any) => apiCall(`/mrs/${id}/reject`, { method: 'POST', body: JSON.stringify(data || {}) }),
};

// Quotations API
export const quotationsApi = {
  getAll: () => apiCall('/quotations'),
  getById: (id: string) => apiCall(`/quotations/${id}`),
  getByMR: (mrId: string) => apiCall(`/quotations?mrId=${mrId}`),
  create: (data: any) => apiCall('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/quotations/${id}`, { method: 'DELETE' }),
};

// Comparative Statements API
export const csApi = {
  getAll: () => apiCall('/comparative-statements'),
  getById: (id: string) => apiCall(`/comparative-statements/${id}`),
  create: (data: any) => apiCall('/comparative-statements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/comparative-statements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/comparative-statements/${id}`, { method: 'DELETE' }),
  selectSupplier: (id: string, supplierId: string) => 
    apiCall(`/comparative-statements/${id}/select-supplier`, { 
      method: 'POST', 
      body: JSON.stringify({ supplierId }) 
    }),
};

// Purchase Orders API
export const posApi = {
  getAll: () => apiCall('/pos'),
  getById: (id: string) => apiCall(`/pos/${id}`),
  create: (data: any) => apiCall('/pos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/pos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/pos/${id}`, { method: 'DELETE' }),
  submit: (id: string) => apiCall(`/pos/${id}/submit`, { method: 'POST' }),
  approve: (id: string, data?: any) => apiCall(`/pos/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  reject: (id: string, data?: any) => apiCall(`/pos/${id}/reject`, { method: 'POST', body: JSON.stringify(data || {}) }),
};

// Purchase Bills API
export const purchaseBillsApi = {
  getAll: () => apiCall('/purchase-bills'),
  getById: (id: string) => apiCall(`/purchase-bills/${id}`),
  getByPO: (poId: string) => apiCall(`/purchase-bills?poId=${poId}`),
  create: (data: any) => apiCall('/purchase-bills', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase-bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase-bills/${id}`, { method: 'DELETE' }),
};

// Items API
export const itemsApi = {
  getAll: () => apiCall('/items'),
  getById: (id: string) => apiCall(`/items/${id}`),
  create: (data: any) => apiCall('/items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/items/${id}`, { method: 'DELETE' }),
};

const API_URL = import.meta.env.VITE_API_URL || 'http://88.222.244.251:5005/api';

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

  const result = await response.json();
  // Extract data from wrapped response { success: true, data: [...] }
  return result.data !== undefined ? result.data : result;
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
  approve: (id: string, data?: any) =>
    apiCall(`/purchase/quotations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  reject: (id: string, data?: any) =>
    apiCall(`/purchase/quotations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

};

// Comparative Statements API
export const csApi = {
  getAll: () => apiCall('/purchase/comparative-statements'),
  getById: (id: string) => apiCall(`/purchase/comparative-statements/${id}`),
  create: (data: any) => apiCall('/purchase/comparative-statements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/comparative-statements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/comparative-statements/${id}`, { method: 'DELETE' }),
  selectSupplier: (id: string, supplierId: string) => 
    apiCall(`/purchase/comparative-statements/${id}/select-supplier`, { 
      method: 'POST', 
      body: JSON.stringify({ supplierId }) 
    }),
};

// Purchase Orders API
export const posApi = {
  getAll: () => apiCall('/purchase/pos'),
  getById: (id: string) => apiCall(`/purchase/pos/${id}`),
  create: (data: any) => apiCall('/purchase/pos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/pos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/pos/${id}`, { method: 'DELETE' }),
  submit: (id: string) => apiCall(`/purchase/pos/${id}/submit`, { method: 'POST' }),
  approve: (id: string, data?: any) => apiCall(`/purchase/pos/${id}/approve`, { method: 'POST', body: JSON.stringify(data || {}) }),
  reject: (id: string, data?: any) => apiCall(`/purchase/pos/${id}/reject`, { method: 'POST', body: JSON.stringify(data || {}) }),
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

// Suppliers API
export const suppliersApi = {
  getAll: () => apiCall('/purchase/suppliers'),
  getById: (id: string) => apiCall(`/purchase/suppliers/${id}`),
  create: (data: any) => apiCall('/purchase/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/suppliers/${id}`, { method: 'DELETE' }),
};

// Material Rates API
export const materialRatesApi = {
  getAll: () => apiCall('/purchase/material-rates'),
  getById: (id: string) => apiCall(`/purchase/material-rates/${id}`),
  create: (data: any) => apiCall('/purchase/material-rates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/purchase/material-rates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/purchase/material-rates/${id}`, { method: 'DELETE' }),
};

// Items API
export const itemsApi = {
  getAll: () => apiCall('/site/items'),
  getById: (id: string) => apiCall(`/site/items/${id}`),
  create: (data: any) => apiCall('/site/items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/site/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/site/items/${id}`, { method: 'DELETE' }),
};

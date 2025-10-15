/**
 * Purchase Module API Client
 * This file contains all API calls for the Purchase Module
 * Update the BASE_URL to point to your Node.js + MongoDB backend
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('erp_auth_token') || '';
};

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || `HTTP ${response.status}`);
  }

  return result; // Return full { success, data, message } structure
}

// ============= SUPPLIERS =============

export const supplierApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.active !== undefined)
      queryParams.append('active', params.active.toString());

    return apiRequest(`/purchase/suppliers?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase/suppliers/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/suppliers/${id}`, {
      method: 'DELETE',
    }),
};

// ============= MATERIAL REQUISITIONS =============

export const mrApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.projectId) queryParams.append('projectId', params.projectId);
    if (params?.status) queryParams.append('status', params.status);

    return apiRequest(`/purchase/mrs?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase/mrs/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/mrs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/mrs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: (id: string) =>
    apiRequest(`/purchase/mrs/${id}/submit`, {
      method: 'POST',
    }),

  approve: (id: string, action: 'approve' | 'reject', remarks?: string) =>
    apiRequest(`/purchase/mrs/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/mrs/${id}`, {
      method: 'DELETE',
    }),
};

// ============= QUOTATIONS =============

export const quotationApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    supplierId?: string;
    mrId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.supplierId)
      queryParams.append('supplierId', params.supplierId);
    if (params?.mrId) queryParams.append('mrId', params.mrId);
    if (params?.status) queryParams.append('status', params.status);

    return apiRequest(`/purchase/quotations?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase/quotations/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string, remarks?: string) =>
    apiRequest(`/purchase/quotations/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/quotations/${id}`, {
      method: 'DELETE',
    }),
};

// ============= COMPARATIVE STATEMENTS =============

export const comparativeStatementApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    mrId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.mrId) queryParams.append('mrId', params.mrId);

    return apiRequest(`/purchase/comparative-statements?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase/comparative-statements/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/comparative-statements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  selectSupplier: (
    id: string,
    supplierId: string,
    quotationId: string,
    remarks?: string
  ) =>
    apiRequest(`/purchase/comparative-statements/${id}/select`, {
      method: 'POST',
      body: JSON.stringify({ supplierId, quotationId, remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/comparative-statements/${id}`, {
      method: 'DELETE',
    }),
};

// ============= PURCHASE ORDERS =============

export const poApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    supplierId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.projectId) queryParams.append('projectId', params.projectId);
    if (params?.supplierId)
      queryParams.append('supplierId', params.supplierId);
    if (params?.status) queryParams.append('status', params.status);

    return apiRequest(`/purchase/pos?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase/pos/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/pos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/pos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: (id: string) =>
    apiRequest(`/purchase/pos/${id}/submit`, {
      method: 'POST',
    }),

  approve: (id: string, action: 'approve' | 'reject', remarks?: string) =>
    apiRequest(`/purchase/pos/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks }),
    }),

  issue: (id: string) =>
    apiRequest(`/purchase/pos/${id}/issue`, {
      method: 'POST',
    }),

  close: (id: string) =>
    apiRequest(`/purchase/pos/${id}/close`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/pos/${id}`, {
      method: 'DELETE',
    }),
};

// ============= PURCHASE BILLS =============

export const purchaseBillApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    poId?: string;
    supplierId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.poId) queryParams.append('poId', params.poId);
    if (params?.supplierId)
      queryParams.append('supplierId', params.supplierId);
    if (params?.status) queryParams.append('status', params.status);

    return apiRequest(`/purchase/bills?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase/bills/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  approve: (id: string, remarks?: string) =>
    apiRequest(`/purchase/bills/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),

  recordPayment: (
    id: string,
    data: {
      amount: number;
      paymentDate: string;
      paymentMode: string;
      referenceNo?: string;
      remarks?: string;
    }
  ) =>
    apiRequest(`/purchase/bills/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/bills/${id}`, {
      method: 'DELETE',
    }),
};

// ============= MATERIAL RATES =============

export const materialRateApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    supplierId?: string;
    itemId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.supplierId)
      queryParams.append('supplierId', params.supplierId);
    if (params?.itemId) queryParams.append('itemId', params.itemId);
    if (params?.status) queryParams.append('status', params.status);

    return apiRequest(`/purchase/material-rates?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase/material-rates/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/material-rates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/material-rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deactivate: (id: string) =>
    apiRequest(`/purchase/material-rates/${id}/deactivate`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/material-rates/${id}`, {
      method: 'DELETE',
    }),
};

// ============= PROJECTS =============

export const projectApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiRequest(`/engineering/projects${params ? `?page=${params.page || 1}&limit=${params.limit || 50}` : ''}`),

  getById: (id: string) => apiRequest(`/engineering/projects/${id}`),

  create: (data: any) =>
    apiRequest('/engineering/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/engineering/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/engineering/projects/${id}`, {
      method: 'DELETE',
    }),
};

// ============= ITEMS =============

export const itemApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    
    return apiRequest(`/site/items${queryParams.toString() ? `?${queryParams}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/site/items/${id}`),

  create: (data: any) =>
    apiRequest('/site/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/site/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/site/items/${id}`, {
      method: 'DELETE',
    }),

  // Stock related
  getStock: () => apiRequest('/site/stock'),

  getStockByLocation: (location: string) => apiRequest(`/site/stock/location/${location}`),
};

// ============= DASHBOARD & REPORTS =============

export const purchaseDashboardApi = {
  getStats: () => apiRequest('/purchase/dashboard'),

  getReports: (params: {
    reportType: string;
    startDate?: string;
    endDate?: string;
    projectId?: string;
    supplierId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', params.reportType);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.projectId) queryParams.append('projectId', params.projectId);
    if (params.supplierId)
      queryParams.append('supplierId', params.supplierId);

    return apiRequest(`/purchase/reports?${queryParams}`);
  },
};

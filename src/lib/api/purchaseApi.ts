/**
 * Purchase Module API Client
 * This file contains all API calls for the Purchase Module
 * Update the BASE_URL to point to your Node.js + MongoDB backend
 */

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:5005/api';

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

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
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

    return apiRequest(`/suppliers?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/suppliers/${id}`),

  create: (data: any) =>
    apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/suppliers/${id}`, {
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

    return apiRequest(`/mrs?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/mrs/${id}`),

  create: (data: any) =>
    apiRequest('/mrs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/mrs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: (id: string) =>
    apiRequest(`/mrs/${id}/submit`, {
      method: 'POST',
    }),

  approve: (id: string, action: 'approve' | 'reject', remarks?: string) =>
    apiRequest(`/mrs/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/mrs/${id}`, {
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

    return apiRequest(`/quotations?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/quotations/${id}`),

  create: (data: any) =>
    apiRequest('/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string, remarks?: string) =>
    apiRequest(`/quotations/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/quotations/${id}`, {
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

    return apiRequest(`/comparative-statements?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/comparative-statements/${id}`),

  create: (data: any) =>
    apiRequest('/comparative-statements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  selectSupplier: (
    id: string,
    supplierId: string,
    quotationId: string,
    remarks?: string
  ) =>
    apiRequest(`/comparative-statements/${id}/select`, {
      method: 'POST',
      body: JSON.stringify({ supplierId, quotationId, remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/comparative-statements/${id}`, {
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

    return apiRequest(`/pos?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/pos/${id}`),

  create: (data: any) =>
    apiRequest('/pos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/pos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: (id: string) =>
    apiRequest(`/pos/${id}/submit`, {
      method: 'POST',
    }),

  approve: (id: string, action: 'approve' | 'reject', remarks?: string) =>
    apiRequest(`/pos/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks }),
    }),

  issue: (id: string) =>
    apiRequest(`/pos/${id}/issue`, {
      method: 'POST',
    }),

  close: (id: string) =>
    apiRequest(`/pos/${id}/close`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    apiRequest(`/pos/${id}`, {
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

    return apiRequest(`/purchase-bills?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/purchase-bills/${id}`),

  create: (data: any) =>
    apiRequest('/purchase-bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase-bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  approve: (id: string, remarks?: string) =>
    apiRequest(`/purchase-bills/${id}/approve`, {
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
    apiRequest(`/purchase-bills/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase-bills/${id}`, {
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

    return apiRequest(`/material-rates?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/material-rates/${id}`),

  create: (data: any) =>
    apiRequest('/material-rates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/material-rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deactivate: (id: string) =>
    apiRequest(`/material-rates/${id}/deactivate`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    apiRequest(`/material-rates/${id}`, {
      method: 'DELETE',
    }),
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

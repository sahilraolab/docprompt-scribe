/**
 * Purchase Module API Client
 * Matches API Contract v1
 */

import { apiClient } from './client';

// Helper function to make API requests using the centralized client
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const result = await apiClient.request(endpoint, options);
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

    const query = queryParams.toString();
    return apiRequest(`/purchase/suppliers${query ? `?${query}` : ''}`);
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
// POST /purchase/requisitions
// PUT /purchase/requisitions/:id/submit

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

    const query = queryParams.toString();
    return apiRequest(`/purchase/requisitions${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/purchase/requisitions/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/requisitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: (id: string) =>
    apiRequest(`/purchase/requisitions/${id}/submit`, {
      method: 'PUT',
    }),

  approve: (id: string, action: 'approve' | 'reject', remarks?: string) =>
    apiRequest(`/purchase/requisitions/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ action, remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/requisitions/${id}`, {
      method: 'DELETE',
    }),
};

// ============= RFQ =============
// POST /purchase/rfqs

export const rfqApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    requisitionId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.requisitionId) queryParams.append('requisitionId', params.requisitionId);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest(`/purchase/rfqs${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/purchase/rfqs/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/rfqs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  close: (id: string) =>
    apiRequest(`/purchase/rfqs/${id}/close`, {
      method: 'PUT',
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/rfqs/${id}`, {
      method: 'DELETE',
    }),
};

// ============= QUOTATIONS =============
// POST /purchase/quotations
// PUT /purchase/quotations/:id/approve

export const quotationApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    supplierId?: string;
    rfqId?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params?.rfqId) queryParams.append('rfqId', params.rfqId);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest(`/purchase/quotations${query ? `?${query}` : ''}`);
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

  approve: (id: string, remarks?: string) =>
    apiRequest(`/purchase/quotations/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    }),

  reject: (id: string, remarks?: string) =>
    apiRequest(`/purchase/quotations/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
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

    const query = queryParams.toString();
    return apiRequest(`/purchase/comparative-statements${query ? `?${query}` : ''}`);
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
// POST /purchase/po
// Only one PO per quotation, quotation must be APPROVED

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
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest(`/purchase/po${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/purchase/po/${id}`),

  create: (data: any) =>
    apiRequest('/purchase/po', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase/po/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submit: (id: string) =>
    apiRequest(`/purchase/po/${id}/submit`, {
      method: 'PUT',
    }),

  approve: (id: string, remarks?: string) =>
    apiRequest(`/purchase/po/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    }),

  reject: (id: string, remarks?: string) =>
    apiRequest(`/purchase/po/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    }),

  cancel: (id: string, remarks?: string) =>
    apiRequest(`/purchase/po/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase/po/${id}`, {
      method: 'DELETE',
    }),
};

// ============= PURCHASE BILLS =============
// POST /purchase/bills
// PUT /purchase/bills/:id/post

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
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest(`/purchase/bills${query ? `?${query}` : ''}`);
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

  post: (id: string) =>
    apiRequest(`/purchase/bills/${id}/post`, {
      method: 'PUT',
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
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params?.itemId) queryParams.append('itemId', params.itemId);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest(`/purchase/material-rates${query ? `?${query}` : ''}`);
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
    if (params.supplierId) queryParams.append('supplierId', params.supplierId);

    return apiRequest(`/purchase/reports?${queryParams}`);
  },
};

import { apiClient } from './client';

/* =====================================================
   MATERIAL REQUISITION (MR)
===================================================== */

export const requisitionApi = {
  list: (params?: { projectId?: number }) => {
    if (typeof params?.projectId !== 'number') {
      return Promise.resolve([]); // 🔒 HARD GUARD
    }

    return apiClient.request(
      `/purchase/requisitions?projectId=${params.projectId}`
    );
  },

  getById: (id: number) =>
    apiClient.request(`/purchase/requisitions/${id}`),

  create: (data: {
    projectId: number;
    budgetId: number;
    estimateId: number;
  }) =>
    apiClient.request('/purchase/requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submit: (id: number) =>
    apiClient.request(`/purchase/requisitions/${id}/submit`, {
      method: 'PUT',
    }),
};

// Alias for mrApi
export const mrApi = {
  list: (params?: { projectId?: number }) => {
    const url = params?.projectId
      ? `/purchase/requisitions?projectId=${params.projectId}`
      : '/purchase/requisitions';
    return apiClient.request(url);
  },
  getById: (id: number) => apiClient.request(`/purchase/requisitions/${id}`),
  create: (data: any) =>
    apiClient.request('/purchase/requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submit: (id: number) =>
    apiClient.request(`/purchase/requisitions/${id}/submit`, {
      method: 'PUT',
    }),
};

/* =====================================================
   RFQ
===================================================== */

export const rfqApi = {
  list: (params?: { requisitionId?: number }) => {
    if (typeof params?.requisitionId !== "number") {
      return Promise.resolve([]); // 🔒 HARD GUARD
    }

    return apiClient.request(
      `/purchase/rfqs?requisitionId=${params.requisitionId}`
    );
  },

  create: (data: { requisitionId: number; supplierId: number; closingDate?: string }) =>
    apiClient.request("/purchase/rfqs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  close: (id: number) =>
    apiClient.request(`/purchase/rfqs/${id}/close`, {
      method: "PUT",
    }),
};

/* =====================================================
   QUOTATION
===================================================== */

export const quotationApi = {
  list: (params?: { rfqId?: number }) => {
    if (typeof params?.rfqId !== 'number') {
      return Promise.resolve([]); // 🔒 HARD GUARD
    }

    return apiClient.request(
      `/purchase/quotations?rfqId=${params.rfqId}`
    );
  },

  getById: (id: number) =>
    apiClient.request(`/purchase/quotations/${id}`),

  create: (data: any) =>
    apiClient.request('/purchase/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approve: (id: number) =>
    apiClient.request(`/purchase/quotations/${id}/approve`, {
      method: 'PUT',
    }),
};

/* =====================================================
   PURCHASE ORDER (PO)
===================================================== */

export const poApi = {
  list: (params?: { projectId?: number }) => {
    if (typeof params?.projectId !== 'number') {
      return Promise.resolve([]); // 🔒 HARD GUARD
    }

    return apiClient.request(
      `/purchase/po?projectId=${params.projectId}`
    );
  },

  getById: (id: number) =>
    apiClient.request(`/purchase/po/${id}`),

  create: (quotationId: number) =>
    apiClient.request('/purchase/po', {
      method: 'POST',
      body: JSON.stringify({ quotationId }),
    }),
};

/* =====================================================
   PURCHASE BILL
===================================================== */

export const purchaseBillApi = {
  list: (params?: { projectId?: number }) => {
    if (typeof params?.projectId !== 'number') {
      return Promise.resolve([]); // 🔒 HARD GUARD
    }

    return apiClient.request(
      `/purchase/bills?projectId=${params.projectId}`
    );
  },

  getById: (id: number) =>
    apiClient.request(`/purchase/bills/${id}`),

  create: (data: {
    poId: number;
    grnId: number;
    basicAmount: number;
    taxAmount: number;
  }) =>
    apiClient.request('/purchase/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  postToAccounts: (id: number) =>
    apiClient.request(`/purchase/bills/${id}/post`, {
      method: 'PUT',
    }),
};

/* =====================================================
   COMPARATIVE STATEMENT
===================================================== */

export const comparativeStatementApi = {
  list: () => apiClient.request('/purchase/comparative-statements'),
  getById: (id: number | string) =>
    apiClient.request(`/purchase/comparative-statements/${id}`),
  create: (data: any) =>
    apiClient.request('/purchase/comparative-statements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/* =====================================================
   MATERIAL RATE
===================================================== */

export const materialRateApi = {
  list: () => apiClient.request('/purchase/rates'),
  getById: (id: number | string) =>
    apiClient.request(`/purchase/rates/${id}`),
  create: (data: any) =>
    apiClient.request('/purchase/rates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: any) =>
    apiClient.request(`/purchase/rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

/* =====================================================
   PURCHASE DASHBOARD
===================================================== */

export const purchaseDashboardApi = {
  getStats: (projectId?: number) => {
    const url = projectId
      ? `/purchase/dashboard?projectId=${projectId}`
      : '/purchase/dashboard';
    return apiClient.request(url);
  },
};

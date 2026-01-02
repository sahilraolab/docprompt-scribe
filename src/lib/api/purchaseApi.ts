import { apiClient } from './client';

/* =====================================================
   MATERIAL REQUISITION (MR)
===================================================== */

export const requisitionApi = {
  list: (params?: {
    projectId?: number;
    status?: string;
  }) => {
    const qs = new URLSearchParams();

    if (typeof params?.projectId === 'number') {
      qs.append('projectId', String(params.projectId));
    }

    if (typeof params?.status === 'string' && params.status.length > 0) {
      qs.append('status', params.status);
    }

    const query = qs.toString();
    return apiClient.request(
      query ? `/purchase/requisitions?${query}` : `/purchase/requisitions`
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

/* =====================================================
   RFQ
===================================================== */

export const rfqApi = {
  list: (params?: { requisitionId?: number }) => {
    const qs = new URLSearchParams();

    if (typeof params?.requisitionId === 'number') {
      qs.append('requisitionId', String(params.requisitionId));
    }

    const query = qs.toString();
    return apiClient.request(
      query ? `/purchase/rfqs?${query}` : `/purchase/rfqs`
    );
  },

  create: (data: {
    requisitionId: number;
    supplierId: number;
  }) =>
    apiClient.request('/purchase/rfqs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/* =====================================================
   QUOTATION
===================================================== */

export const quotationApi = {
  list: (params?: {
    rfqId?: number;
    status?: string;
  }) => {
    const qs = new URLSearchParams();

    if (typeof params?.rfqId === 'number') {
      qs.append('rfqId', String(params.rfqId));
    }

    if (typeof params?.status === 'string' && params.status.length > 0) {
      qs.append('status', params.status);
    }

    const query = qs.toString();
    return apiClient.request(
      query ? `/purchase/quotations?${query}` : `/purchase/quotations`
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
  list: (params?: {
    projectId?: number;
    supplierId?: number;
    status?: string;
  }) => {
    const qs = new URLSearchParams();

    if (typeof params?.projectId === 'number') {
      qs.append('projectId', String(params.projectId));
    }

    if (typeof params?.supplierId === 'number') {
      qs.append('supplierId', String(params.supplierId));
    }

    if (typeof params?.status === 'string' && params.status.length > 0) {
      qs.append('status', params.status);
    }

    const query = qs.toString();
    return apiClient.request(
      query ? `/purchase/po?${query}` : `/purchase/po`
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
  list: (params?: {
    poId?: number;
    supplierId?: number;
    status?: string;
  }) => {
    const qs = new URLSearchParams();

    if (typeof params?.poId === 'number') {
      qs.append('poId', String(params.poId));
    }

    if (typeof params?.supplierId === 'number') {
      qs.append('supplierId', String(params.supplierId));
    }

    if (typeof params?.status === 'string' && params.status.length > 0) {
      qs.append('status', params.status);
    }

    const query = qs.toString();
    return apiClient.request(
      query ? `/purchase/bills?${query}` : `/purchase/bills`
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

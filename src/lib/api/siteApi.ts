/**
 * Site/Inventory Module API Client
 * Aligned with backend: /inventory/* and /site/* routes
 * 
 * Backend endpoints:
 * - POST /inventory/grn - Create GRN
 * - PUT /inventory/grn/:id/approve - Approve GRN
 * - POST /inventory/issue - Issue material
 * - GET /inventory/stock - Get stock
 * - GET /inventory/ledger - Get stock ledger
 * - POST /inventory/transfer - Transfer stock
 */

import { apiClient } from '@/lib/api/client';

const INVENTORY_BASE = '/inventory';
const SITE_BASE = '/site';
const QAQC_BASE = '/qaqc';

// =============== SITE API (Combined) ===============
export const siteApi = {
  // ---------------- Items (from masters) ----------------
  getAllItems: async () => {
    return apiClient.request('/masters/materials');
  },
  getItemById: async (id: string) => {
    return apiClient.request(`/masters/materials/${id}`);
  },
  createItem: async (data: any) => {
    return apiClient.request('/masters/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateItem: async (id: string, data: any) => {
    return apiClient.request(`/masters/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteItem: async (id: string) => {
    return apiClient.request(`/masters/materials/${id}`, {
      method: 'DELETE',
    });
  },

  // ---------------- Stock (Backend: GET /inventory/stock, GET /inventory/ledger) ----------------
  getAllStock: async (params?: { projectId?: string; location?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${INVENTORY_BASE}/stock${query}`);
  },
  getStockById: async (id: string) => {
    return apiClient.request(`${INVENTORY_BASE}/stock/${id}`);
  },
  getStockByProject: async (projectId: string) => {
    return apiClient.request(`${INVENTORY_BASE}/stock?projectId=${projectId}`);
  },
  getStockLedger: async (params?: { itemId?: string; projectId?: string; fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${INVENTORY_BASE}/ledger${query}`);
  },
  adjustStock: async (data: { itemId: string; projectId: string; qty: number; type: 'add' | 'subtract'; reason: string }) => {
    // Note: Backend may not have this endpoint - stock adjusts via GRN/Issue
    return apiClient.request(`${INVENTORY_BASE}/stock/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ---------------- GRN (Backend: POST /inventory/grn, PUT /inventory/grn/:id/approve) ----------------
  getAllGRN: async (params?: { poId?: string; status?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${INVENTORY_BASE}/grn${query}`);
  },
  getGRNById: async (id: string) => {
    return apiClient.request(`${INVENTORY_BASE}/grn/${id}`);
  },
  createGRN: async (data: any) => {
    return apiClient.request(`${INVENTORY_BASE}/grn`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateGRN: async (id: string, data: any) => {
    return apiClient.request(`${INVENTORY_BASE}/grn/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  approveGRN: async (id: string, remarks?: string) => {
    return apiClient.request(`${INVENTORY_BASE}/grn/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    });
  },

  // ---------------- Material Issues (Backend: POST /inventory/issue) ----------------
  getAllIssues: async (params?: { projectId?: string; status?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${INVENTORY_BASE}/issue${query}`);
  },
  getIssueById: async (id: string) => {
    return apiClient.request(`${INVENTORY_BASE}/issue/${id}`);
  },
  createIssue: async (data: any) => {
    return apiClient.request(`${INVENTORY_BASE}/issue`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateIssue: async (id: string, data: any) => {
    return apiClient.request(`${INVENTORY_BASE}/issue/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  approveIssue: async (id: string, remarks?: string) => {
    return apiClient.request(`${INVENTORY_BASE}/issue/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    });
  },

  // ---------------- Stock Transfers (Backend: POST /inventory/transfer) ----------------
  getAllTransfers: async (params?: { fromProjectId?: string; toProjectId?: string; status?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${INVENTORY_BASE}/transfer${query}`);
  },
  getTransferById: async (id: string) => {
    return apiClient.request(`${INVENTORY_BASE}/transfer/${id}`);
  },
  createTransfer: async (data: any) => {
    return apiClient.request(`${INVENTORY_BASE}/transfer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateTransfer: async (id: string, data: any) => {
    return apiClient.request(`${INVENTORY_BASE}/transfer/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  approveTransfer: async (id: string, remarks?: string) => {
    return apiClient.request(`${INVENTORY_BASE}/transfer/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    });
  },
  receiveTransfer: async (id: string) => {
    return apiClient.request(`${INVENTORY_BASE}/transfer/${id}/receive`, {
      method: 'PUT',
    });
  },

  // ---------------- QA/QC (Backend: /qaqc/*) ----------------
  getAllQC: async () => {
    return apiClient.request(`${QAQC_BASE}/test-report`);
  },
  getQCById: async (id: string) => {
    return apiClient.request(`${QAQC_BASE}/test-report/${id}`);
  },
  createQC: async (data: any) => {
    return apiClient.request(`${QAQC_BASE}/test-report`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateQC: async (id: string, data: any) => {
    return apiClient.request(`${QAQC_BASE}/test-report/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ---------------- DPR/WPR (Backend: POST /site/dpr, POST /site/wpr) ----------------
  createDPR: async (data: any) => {
    return apiClient.request(`${SITE_BASE}/dpr`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  createWPR: async (data: any) => {
    return apiClient.request(`${SITE_BASE}/wpr`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAllDPR: async (params?: { projectId?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${SITE_BASE}/dpr${query}`);
  },
  getAllWPR: async (params?: { projectId?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${SITE_BASE}/wpr${query}`);
  },
};

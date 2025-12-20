// src/lib/api/inventoryApi.ts
import { apiClient } from './client';

const INVENTORY_BASE = '/inventory';

export const inventoryApi = {
  // Stock
  getAllStock: () => apiClient.request(`${INVENTORY_BASE}/stock`),
  getStockByItem: (itemId: string) => apiClient.request(`${INVENTORY_BASE}/stock/${itemId}`),
  getStockByProject: (projectId: string) => apiClient.request(`${INVENTORY_BASE}/stock?projectId=${projectId}`),
  getStockByLocation: (location: string) => apiClient.request(`${INVENTORY_BASE}/stock?location=${encodeURIComponent(location)}`),

  // Stock Ledger
  getStockLedger: (params?: { itemId?: string; projectId?: string; fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiClient.request(`${INVENTORY_BASE}/stock-ledger${query}`);
  },

  // GRN (Goods Receipt Notes)
  getAllGRN: () => apiClient.request(`${INVENTORY_BASE}/grn`),
  getGRNById: (id: string) => apiClient.request(`${INVENTORY_BASE}/grn/${id}`),
  createGRN: (data: any) =>
    apiClient.request(`${INVENTORY_BASE}/grn`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGRN: (id: string, data: any) =>
    apiClient.request(`${INVENTORY_BASE}/grn/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  approveGRN: (id: string) =>
    apiClient.request(`${INVENTORY_BASE}/grn/${id}/approve`, {
      method: 'POST',
    }),

  // Material Issues
  getAllIssues: () => apiClient.request(`${INVENTORY_BASE}/issues`),
  getIssueById: (id: string) => apiClient.request(`${INVENTORY_BASE}/issues/${id}`),
  createIssue: (data: any) =>
    apiClient.request(`${INVENTORY_BASE}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateIssue: (id: string, data: any) =>
    apiClient.request(`${INVENTORY_BASE}/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  approveIssue: (id: string) =>
    apiClient.request(`${INVENTORY_BASE}/issues/${id}/approve`, {
      method: 'POST',
    }),

  // Stock Transfers
  getAllTransfers: () => apiClient.request(`${INVENTORY_BASE}/transfers`),
  getTransferById: (id: string) => apiClient.request(`${INVENTORY_BASE}/transfers/${id}`),
  createTransfer: (data: any) =>
    apiClient.request(`${INVENTORY_BASE}/transfers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTransfer: (id: string, data: any) =>
    apiClient.request(`${INVENTORY_BASE}/transfers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  approveTransfer: (id: string) =>
    apiClient.request(`${INVENTORY_BASE}/transfers/${id}/approve`, {
      method: 'POST',
    }),
  receiveTransfer: (id: string) =>
    apiClient.request(`${INVENTORY_BASE}/transfers/${id}/receive`, {
      method: 'POST',
    }),
};

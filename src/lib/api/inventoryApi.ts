/**
 * Inventory Module API Client
 * Aligned 1:1 with backend routes: /api/inventory/*
 * 
 * Backend endpoints:
 * - POST   /inventory/grn              - Create GRN
 * - PUT    /inventory/grn/:id/approve  - Approve GRN
 * - GET    /inventory/grn              - List GRNs
 * - GET    /inventory/grn/:id          - Get GRN by ID
 * 
 * - POST   /inventory/issue            - Create Material Issue
 * - PUT    /inventory/issue/:id/cancel - Cancel Material Issue
 * - GET    /inventory/issue            - List Issues
 * - GET    /inventory/issue/:id        - Get Issue by ID
 * 
 * - POST   /inventory/transfer         - Create Stock Transfer
 * - GET    /inventory/transfer         - List Transfers
 * - GET    /inventory/transfer/:id     - Get Transfer by ID
 * 
 * - GET    /inventory/stock            - Get Stock
 * - GET    /inventory/ledger           - Get Stock Ledger
 */

import { apiClient } from './client';
import type { 
  CreateGRNRequest, 
  CreateMaterialIssueRequest, 
  CreateStockTransferRequest 
} from '@/types/inventory';

const BASE = '/inventory';

export const inventoryApi = {
  // =============== GRN ===============
  
  /** Create GRN - POST /inventory/grn */
  createGRN: (data: CreateGRNRequest) =>
    apiClient.request(`${BASE}/grn`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Approve GRN - PUT /inventory/grn/:id/approve */
  approveGRN: (id: number | string) =>
    apiClient.request(`${BASE}/grn/${id}/approve`, {
      method: 'PUT',
    }),

  /** List all GRNs - GET /inventory/grn */
  getAllGRN: (params?: { projectId?: number; poId?: number; status?: string }) => {
    const query = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
      : '';
    return apiClient.request(`${BASE}/grn${query}`);
  },

  /** Get GRN by ID - GET /inventory/grn/:id */
  getGRNById: (id: number | string) =>
    apiClient.request(`${BASE}/grn/${id}`),

  // =============== Material Issue ===============
  
  /** Create Material Issue - POST /inventory/issue */
  createIssue: (data: CreateMaterialIssueRequest) =>
    apiClient.request(`${BASE}/issue`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Cancel Material Issue - PUT /inventory/issue/:id/cancel */
  cancelIssue: (id: number | string) =>
    apiClient.request(`${BASE}/issue/${id}/cancel`, {
      method: 'PUT',
    }),

  /** List all Issues - GET /inventory/issue */
  getAllIssues: (params?: { projectId?: number; status?: string }) => {
    const query = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
      : '';
    return apiClient.request(`${BASE}/issue${query}`);
  },

  /** Get Issue by ID - GET /inventory/issue/:id */
  getIssueById: (id: number | string) =>
    apiClient.request(`${BASE}/issue/${id}`),

  // =============== Stock Transfer ===============
  
  /** Create Stock Transfer - POST /inventory/transfer */
  createTransfer: (data: CreateStockTransferRequest) =>
    apiClient.request(`${BASE}/transfer`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** List all Transfers - GET /inventory/transfer */
  getAllTransfers: (params?: { projectId?: number; status?: string }) => {
    const query = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
      : '';
    return apiClient.request(`${BASE}/transfer${query}`);
  },

  /** Get Transfer by ID - GET /inventory/transfer/:id */
  getTransferById: (id: number | string) =>
    apiClient.request(`${BASE}/transfer/${id}`),

  // =============== Stock ===============
  
  /** Get Stock - GET /inventory/stock */
  getStock: (params?: { projectId?: number; locationId?: number; materialId?: number }) => {
    const query = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
      : '';
    return apiClient.request(`${BASE}/stock${query}`);
  },

  // =============== Stock Ledger ===============
  
  /** Get Stock Ledger - GET /inventory/ledger */
  getStockLedger: (params?: { 
    projectId?: number; 
    locationId?: number; 
    materialId?: number;
    refType?: string;
  }) => {
    const query = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
      : '';
    return apiClient.request(`${BASE}/ledger${query}`);
  },
};

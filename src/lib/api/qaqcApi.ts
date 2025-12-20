// src/lib/api/qaqcApi.ts
import { apiClient } from './client';

const QAQC_BASE = '/qaqc';

export const qaqcApi = {
  // Test Reports
  getAllTestReports: () => apiClient.request(`${QAQC_BASE}/test-reports`),
  getTestReportById: (id: string) => apiClient.request(`${QAQC_BASE}/test-reports/${id}`),
  createTestReport: (data: any) =>
    apiClient.request(`${QAQC_BASE}/test-reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTestReport: (id: string, data: any) =>
    apiClient.request(`${QAQC_BASE}/test-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  approveTestReport: (id: string) =>
    apiClient.request(`${QAQC_BASE}/test-reports/${id}/approve`, {
      method: 'POST',
    }),

  // Snag List
  getAllSnags: () => apiClient.request(`${QAQC_BASE}/snags`),
  getSnagById: (id: string) => apiClient.request(`${QAQC_BASE}/snags/${id}`),
  createSnag: (data: any) =>
    apiClient.request(`${QAQC_BASE}/snags`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSnag: (id: string, data: any) =>
    apiClient.request(`${QAQC_BASE}/snags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  resolveSnag: (id: string, resolution: string) =>
    apiClient.request(`${QAQC_BASE}/snags/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    }),

  // RMC Batches
  getAllRMCBatches: () => apiClient.request(`${QAQC_BASE}/rmc-batches`),
  getRMCBatchById: (id: string) => apiClient.request(`${QAQC_BASE}/rmc-batches/${id}`),
  createRMCBatch: (data: any) =>
    apiClient.request(`${QAQC_BASE}/rmc-batches`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRMCBatch: (id: string, data: any) =>
    apiClient.request(`${QAQC_BASE}/rmc-batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Pour Cards
  getAllPourCards: () => apiClient.request(`${QAQC_BASE}/pour-cards`),
  getPourCardById: (id: string) => apiClient.request(`${QAQC_BASE}/pour-cards/${id}`),
  createPourCard: (data: any) =>
    apiClient.request(`${QAQC_BASE}/pour-cards`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePourCard: (id: string, data: any) =>
    apiClient.request(`${QAQC_BASE}/pour-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  approvePourCard: (id: string) =>
    apiClient.request(`${QAQC_BASE}/pour-cards/${id}/approve`, {
      method: 'POST',
    }),
};

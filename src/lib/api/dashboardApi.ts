// src/lib/api/dashboardApi.ts
import { apiClient } from './client';

const DASHBOARD_BASE = '/dashboard';

export const dashboardApi = {
  // Get main dashboard stats
  getStats: () => apiClient.request(`${DASHBOARD_BASE}/stats`),

  // Get module-specific stats
  getPurchaseStats: () => apiClient.request(`${DASHBOARD_BASE}/purchase`),
  getSiteStats: () => apiClient.request(`${DASHBOARD_BASE}/site`),
  getContractsStats: () => apiClient.request(`${DASHBOARD_BASE}/contracts`),
  getEngineeringStats: () => apiClient.request(`${DASHBOARD_BASE}/engineering`),
  getAccountsStats: () => apiClient.request(`${DASHBOARD_BASE}/accounts`),
  getWorkflowStats: () => apiClient.request(`${DASHBOARD_BASE}/workflow`),

  // Get recent activities
  getRecentActivities: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiClient.request(`${DASHBOARD_BASE}/activities${query}`);
  },

  // Get pending approvals count
  getPendingApprovals: () => apiClient.request(`${DASHBOARD_BASE}/pending-approvals`),

  // Get notifications
  getNotifications: () => apiClient.request(`${DASHBOARD_BASE}/notifications`),
};

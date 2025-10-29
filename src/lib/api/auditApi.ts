// src/lib/api/auditApi.ts
import { apiClient } from './client';

export const auditApi = {
  // ✅ Fetch all logs with optional filters
  getAll: (params?: { module?: string; action?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiClient.request(`/api/audit${query ? `?${query}` : ''}`);
  },

  // ✅ Fetch a single log entry by ID
  getById: (id: string) => apiClient.request(`/api/audit/${id}`),

  // ✅ Create a new audit log (called when actions happen)
  create: (data: {
    module: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: string;
  }) => apiClient.request(`/api/audit`, { method: 'POST', body: JSON.stringify(data) }),
};

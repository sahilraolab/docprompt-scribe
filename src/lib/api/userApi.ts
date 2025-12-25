import { apiClient } from "./client";

const ADMIN_BASE = '/admin';

export const userApi = {
  // Users - matches backend routes
  getAll: () => apiClient.request(`${ADMIN_BASE}/users`),
  
  getById: (id: string | number) => apiClient.request(`${ADMIN_BASE}/users/${id}`),
  
  create: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    roleId: number;
  }) => apiClient.request(`${ADMIN_BASE}/users`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  
  update: (id: string | number, data: {
    name?: string;
    phone?: string;
    isActive?: boolean;
    roleId?: number;
  }) => apiClient.request(`${ADMIN_BASE}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  // Roles - matches backend routes
  getRoles: () => apiClient.request(`${ADMIN_BASE}/roles`),
  
  createRole: (data: { name: string }) =>
    apiClient.request(`${ADMIN_BASE}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  assignPermissions: (roleId: number, permissions: string[]) =>
    apiClient.request(`${ADMIN_BASE}/roles/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permissions }),
    }),

  // Audit logs - matches backend route
  getAuditLogs: () => apiClient.request(`${ADMIN_BASE}/audit-logs`),
};

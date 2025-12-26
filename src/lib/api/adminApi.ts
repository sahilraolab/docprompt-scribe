import { apiClient } from "./client";

const ADMIN_BASE = '/admin';

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: number;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  isActive?: boolean;
  roleId?: number;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export const adminApi = {
  // ================= USERS =================
  getUsers: () => apiClient.request(`${ADMIN_BASE}/users`),

  getUserById: (id: string | number) => apiClient.request(`${ADMIN_BASE}/users/${id}`),

  createUser: (data: CreateUserPayload) => 
    apiClient.request(`${ADMIN_BASE}/users`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateUser: (id: string | number, data: UpdateUserPayload) => 
    apiClient.request(`${ADMIN_BASE}/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ================= ROLES =================
  getRoles: () => apiClient.request(`${ADMIN_BASE}/roles`),

  createRole: (data: CreateRolePayload) =>
    apiClient.request(`${ADMIN_BASE}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  assignPermissions: (roleId: number, permissions: string[]) =>
    apiClient.request(`${ADMIN_BASE}/roles/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permissions }),
    }),

  // ================= AUDIT LOGS =================
  getAuditLogs: () => apiClient.request(`${ADMIN_BASE}/audit-logs`),
};

import { apiClient } from "./client";

const ADMIN_BASE = '/admin';

export const userApi = {
  getAll: () => apiClient.request(`${ADMIN_BASE}/users`),
  getById: (id: string) => apiClient.request(`${ADMIN_BASE}/users/${id}`),
  create: (data: any) =>
    apiClient.request(`${ADMIN_BASE}/users`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiClient.request(`${ADMIN_BASE}/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient.request(`${ADMIN_BASE}/users/${id}`, {
      method: "DELETE",
    }),
  
  // Roles
  getRoles: () => apiClient.request(`${ADMIN_BASE}/roles`),
  getRole: (id: string) => apiClient.request(`${ADMIN_BASE}/roles/${id}`),
  createRole: (data: any) =>
    apiClient.request(`${ADMIN_BASE}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRole: (id: string, data: any) =>
    apiClient.request(`${ADMIN_BASE}/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteRole: (id: string) =>
    apiClient.request(`${ADMIN_BASE}/roles/${id}`, {
      method: "DELETE",
    }),

  // Permissions
  getPermissions: () => apiClient.request(`${ADMIN_BASE}/permissions`),
  assignPermissions: (roleId: string, permissions: string[]) =>
    apiClient.request(`${ADMIN_BASE}/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    }),
};

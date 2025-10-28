import { apiClient } from "./client";

export const userApi = {
  getAll: () => apiClient.request("/users"),
  getById: (id: string) => apiClient.request(`/users/${id}`),
  create: (data: any) =>
    apiClient.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiClient.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient.request(`/users/${id}`, {
      method: "DELETE",
    }),
};

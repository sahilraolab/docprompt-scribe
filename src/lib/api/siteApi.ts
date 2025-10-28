import { apiClient } from '@/lib/api/client';

const API_BASE_URL = '/site';

export const siteApi = {
  // ---------------- Items ----------------
  getAllItems: async () => {
    const res = await apiClient.request(`${API_BASE_URL}/items`, {
      method: 'GET',
    });
    return res.data || res;
  },

  getItemById: async (id: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/items/${id}`, {
      method: 'GET',
    });
    return res.data || res;
  },

  createItem: async (data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  updateItem: async (id: string, data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data || res;
  },

  deleteItem: async (id: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    return res.data || res;
  },

  // ---------------- Stock ----------------
  getAllStock: async () => {
    const res = await apiClient.request(`${API_BASE_URL}/stock`, {
      method: 'GET',
    });
    return res.data || res;
  },

  getStockById: async (id: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/stock/${id}`, {
      method: 'GET',
    });
    return res.data || res;
  },
};

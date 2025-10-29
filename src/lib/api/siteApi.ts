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

  getStockByProject: async (projectId: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/stock?projectId=${projectId}`, {
      method: 'GET',
    });
    return res.data || res;
  },

  // ---------------- GRN (Goods Receipt Notes) ----------------
  getAllGRN: async () => {
    const res = await apiClient.request(`${API_BASE_URL}/grn`, {
      method: 'GET',
    });
    return res.data || res;
  },

  getGRNById: async (id: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/grn/${id}`, {
      method: 'GET',
    });
    return res.data?.data || res.data || res;
  },

  createGRN: async (data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/grn`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },

  updateGRN: async (id: string, data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/grn/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },

  // ---------------- Material Issues ----------------
  getAllIssues: async () => {
    const res = await apiClient.request(`${API_BASE_URL}/issues`, {
      method: 'GET',
    });
    return res.data || res;
  },

  getIssueById: async (id: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/issues/${id}`, {
      method: 'GET',
    });
    return res.data?.data || res.data || res;
  },

  createIssue: async (data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },

  updateIssue: async (id: string, data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },

  // ---------------- Stock Transfers ----------------
  getAllTransfers: async () => {
    const res = await apiClient.request(`${API_BASE_URL}/stock-transfer`, {
      method: 'GET',
    });
    return res.data || res;
  },

  getTransferById: async (id: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/stock-transfer/${id}`, {
      method: 'GET',
    });
    return res.data?.data || res.data || res;
  },

  createTransfer: async (data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/stock-transfer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },

  updateTransfer: async (id: string, data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/stock-transfer/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },

  // ---------------- Quality Control ----------------
  getAllQC: async () => {
    const res = await apiClient.request(`${API_BASE_URL}/qc`, {
      method: 'GET',
    });
    return res.data || res;
  },

  getQCById: async (id: string) => {
    const res = await apiClient.request(`${API_BASE_URL}/qc/${id}`, {
      method: 'GET',
    });
    return res.data?.data || res.data || res;
  },

  createQC: async (data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/qc`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },

  updateQC: async (id: string, data: any) => {
    const res = await apiClient.request(`${API_BASE_URL}/qc/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data?.data || res.data || res;
  },
};

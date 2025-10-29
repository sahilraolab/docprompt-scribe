import { apiClient } from './client';
import { Account, Journal, CostCentre, TaxConfig } from '@/types';

export const accountsApi = {
  // Accounts
  getAccounts: () => 
    apiClient.request('/accounts').then(res => res.data),
  getAccount: (id: string) => 
    apiClient.request(`/accounts/${id}`),
  createAccount: (data: Partial<Account>) => 
    apiClient.request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: string, data: Partial<Account>) => 
    apiClient.request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id: string) => 
    apiClient.request(`/accounts/${id}`, { method: 'DELETE' }),

  // Journals
  getJournals: () => 
    apiClient.request('/journals').then(res => res.data),
  getJournal: (id: string) => 
    apiClient.request(`/journals/${id}`),
  createJournal: (data: Partial<Journal>) => 
    apiClient.request('/journals', { method: 'POST', body: JSON.stringify(data) }),
  updateJournal: (id: string, data: Partial<Journal>) => 
    apiClient.request(`/journals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJournal: (id: string) => 
    apiClient.request(`/journals/${id}`, { method: 'DELETE' }),
  postJournal: (id: string) => 
    apiClient.request(`/journals/${id}/post`, { method: 'POST' }),

  // Ledgers
  getLedgers: () => 
    apiClient.request('/ledgers').then(res => res.data),
  getLedger: (accountId: string, params?: { fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.request(`/ledgers/${accountId}${query}`);
  },

  // Cost Centres
  getCostCentres: () => 
    apiClient.request('/cost-centres').then(res => res.data),
  getCostCentre: (id: string) => 
    apiClient.request(`/cost-centres/${id}`),
  createCostCentre: (data: Partial<CostCentre>) => 
    apiClient.request('/cost-centres', { method: 'POST', body: JSON.stringify(data) }),
  updateCostCentre: (id: string, data: Partial<CostCentre>) => 
    apiClient.request(`/cost-centres/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCostCentre: (id: string) => 
    apiClient.request(`/cost-centres/${id}`, { method: 'DELETE' }),

  // Tax Configs
  getTaxConfigs: () => 
    apiClient.request('/tax-configs').then(res => res.data),
  getTaxConfig: (id: string) => 
    apiClient.request(`/tax-configs/${id}`),
  createTaxConfig: (data: Partial<TaxConfig>) => 
    apiClient.request('/tax-configs', { method: 'POST', body: JSON.stringify(data) }),
  updateTaxConfig: (id: string, data: Partial<TaxConfig>) => 
    apiClient.request(`/tax-configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTaxConfig: (id: string) => 
    apiClient.request(`/tax-configs/${id}`, { method: 'DELETE' }),

  // Reports
  getFinancialSummary: () => 
    apiClient.request('/accounts/reports/summary'),
};

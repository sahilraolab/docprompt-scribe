import { apiClient } from './client';
import { Account, Journal, CostCentre, TaxConfig } from '@/types';

const ACCOUNTS_BASE = '/accounts';

export const accountsApi = {
  // Accounts
  getAccounts: () => 
    apiClient.request(`${ACCOUNTS_BASE}`).then(res => res.data),
  getAccount: (id: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/${id}`),
  createAccount: (data: Partial<Account>) => 
    apiClient.request(`${ACCOUNTS_BASE}`, { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: string, data: Partial<Account>) => 
    apiClient.request(`${ACCOUNTS_BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/${id}`, { method: 'DELETE' }),

  // Vouchers (Journals)
  getJournals: (params?: { status?: string; type?: string; fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.request(`${ACCOUNTS_BASE}/vouchers${query}`).then(res => res.data);
  },
  getJournal: (id: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/vouchers/${id}`),
  createJournal: (data: Partial<Journal>) => 
    apiClient.request(`${ACCOUNTS_BASE}/vouchers`, { method: 'POST', body: JSON.stringify(data) }),
  updateJournal: (id: string, data: Partial<Journal>) => 
    apiClient.request(`${ACCOUNTS_BASE}/vouchers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJournal: (id: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/vouchers/${id}`, { method: 'DELETE' }),
  approveJournal: (id: string, remarks?: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/vouchers/${id}/approve`, { 
      method: 'POST', 
      body: JSON.stringify({ remarks }) 
    }),
  rejectJournal: (id: string, remarks?: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/vouchers/${id}/reject`, { 
      method: 'POST', 
      body: JSON.stringify({ remarks }) 
    }),
  postJournal: (id: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/vouchers/${id}/post`, { method: 'POST' }),

  // Ledgers
  getLedgers: () => 
    apiClient.request(`${ACCOUNTS_BASE}/ledgers`).then(res => res.data),
  getLedger: (accountId: string, params?: { fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.request(`${ACCOUNTS_BASE}/ledgers/${accountId}${query}`);
  },

  // Cost Centres
  getCostCentres: () => 
    apiClient.request(`${ACCOUNTS_BASE}/cost-centers`).then(res => res.data),
  getCostCentre: (id: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/cost-centers/${id}`),
  createCostCentre: (data: Partial<CostCentre>) => 
    apiClient.request(`${ACCOUNTS_BASE}/cost-centers`, { method: 'POST', body: JSON.stringify(data) }),
  updateCostCentre: (id: string, data: Partial<CostCentre>) => 
    apiClient.request(`${ACCOUNTS_BASE}/cost-centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCostCentre: (id: string) => 
    apiClient.request(`${ACCOUNTS_BASE}/cost-centers/${id}`, { method: 'DELETE' }),

  // Tax Configs
  getTaxConfigs: () => 
    apiClient.request('/tax/rates').then(res => res.data),
  getTaxConfig: (id: string) => 
    apiClient.request(`/tax/rates/${id}`),
  createTaxConfig: (data: Partial<TaxConfig>) => 
    apiClient.request('/tax/rates', { method: 'POST', body: JSON.stringify(data) }),
  updateTaxConfig: (id: string, data: Partial<TaxConfig>) => 
    apiClient.request(`/tax/rates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTaxConfig: (id: string) => 
    apiClient.request(`/tax/rates/${id}`, { method: 'DELETE' }),

  // Reports (only POSTED data)
  getFinancialSummary: () => 
    apiClient.request(`${ACCOUNTS_BASE}/reports/summary`),
  getTrialBalance: (params?: { fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.request(`${ACCOUNTS_BASE}/reports/trial-balance${query}`);
  },
  getProfitLoss: (params?: { fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.request(`${ACCOUNTS_BASE}/reports/profit-loss${query}`);
  },
  getBalanceSheet: (params?: { asOfDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.request(`${ACCOUNTS_BASE}/reports/balance-sheet${query}`);
  },
  getCashFlow: (params?: { fromDate?: string; toDate?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiClient.request(`${ACCOUNTS_BASE}/reports/cash-flow${query}`);
  },
};

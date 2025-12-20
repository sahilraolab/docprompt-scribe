import { apiClient } from './client';
import { Partner, ProjectInvestment, ProfitEvent, Distribution } from '@/types/partners';

const PARTNERS_BASE = '/partners';

export const partnersApi = {
  // Partners
  getPartners: () => 
    apiClient.request(`${PARTNERS_BASE}`).then(res => res.data),
  getPartner: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/${id}`),
  createPartner: (data: Partial<Partner>) => 
    apiClient.request(`${PARTNERS_BASE}`, { method: 'POST', body: JSON.stringify(data) }),
  updatePartner: (id: string, data: Partial<Partner>) => 
    apiClient.request(`${PARTNERS_BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePartner: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/${id}`, { method: 'DELETE' }),

  // Project Investments
  getInvestments: () => 
    apiClient.request(`${PARTNERS_BASE}/investments`).then(res => res.data),
  getInvestment: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/investments/${id}`),
  createInvestment: (data: Partial<ProjectInvestment>) => 
    apiClient.request(`${PARTNERS_BASE}/investments`, { method: 'POST', body: JSON.stringify(data) }),
  updateInvestment: (id: string, data: Partial<ProjectInvestment>) => 
    apiClient.request(`${PARTNERS_BASE}/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvestment: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/investments/${id}`, { method: 'DELETE' }),

  // Profit Events
  getProfitEvents: () => 
    apiClient.request(`${PARTNERS_BASE}/profit-events`).then(res => res.data),
  getProfitEvent: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/profit-events/${id}`),
  createProfitEvent: (data: Partial<ProfitEvent>) => 
    apiClient.request(`${PARTNERS_BASE}/profit-events`, { method: 'POST', body: JSON.stringify(data) }),
  updateProfitEvent: (id: string, data: Partial<ProfitEvent>) => 
    apiClient.request(`${PARTNERS_BASE}/profit-events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfitEvent: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/profit-events/${id}`, { method: 'DELETE' }),
  approveProfitEvent: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/profit-events/${id}/approve`, { method: 'POST' }),
  distributeProfitEvent: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/profit-events/${id}/distribute`, { method: 'POST' }),

  // Distributions
  getDistributions: () => 
    apiClient.request(`${PARTNERS_BASE}/distributions`).then(res => res.data),
  getDistribution: (id: string) => 
    apiClient.request(`${PARTNERS_BASE}/distributions/${id}`),
};

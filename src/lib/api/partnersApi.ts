import { apiClient } from './client';
import { Partner, ProjectInvestment, ProfitEvent, Distribution } from '@/types/partners';

export const partnersApi = {
  // Partners
  getPartners: () => 
    apiClient.request('/partners').then(res => res.data),
  getPartner: (id: string) => 
    apiClient.request(`/partners/${id}`),
  createPartner: (data: Partial<Partner>) => 
    apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
  updatePartner: (id: string, data: Partial<Partner>) => 
    apiClient.request(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePartner: (id: string) => 
    apiClient.request(`/partners/${id}`, { method: 'DELETE' }),

  // Project Investments
  getInvestments: () => 
    apiClient.request('/investments').then(res => res.data),
  getInvestment: (id: string) => 
    apiClient.request(`/investments/${id}`),
  createInvestment: (data: Partial<ProjectInvestment>) => 
    apiClient.request('/investments', { method: 'POST', body: JSON.stringify(data) }),
  updateInvestment: (id: string, data: Partial<ProjectInvestment>) => 
    apiClient.request(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvestment: (id: string) => 
    apiClient.request(`/investments/${id}`, { method: 'DELETE' }),

  // Profit Events
  getProfitEvents: () => 
    apiClient.request('/profit-events').then(res => res.data),
  getProfitEvent: (id: string) => 
    apiClient.request(`/profit-events/${id}`),
  createProfitEvent: (data: Partial<ProfitEvent>) => 
    apiClient.request('/profit-events', { method: 'POST', body: JSON.stringify(data) }),
  updateProfitEvent: (id: string, data: Partial<ProfitEvent>) => 
    apiClient.request(`/profit-events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfitEvent: (id: string) => 
    apiClient.request(`/profit-events/${id}`, { method: 'DELETE' }),
  approveProfitEvent: (id: string) => 
    apiClient.request(`/profit-events/${id}/approve`, { method: 'POST' }),
  distributeProfitEvent: (id: string) => 
    apiClient.request(`/profit-events/${id}/distribute`, { method: 'POST' }),

  // Distributions
  getDistributions: () => 
    apiClient.request('/distributions').then(res => res.data),
  getDistribution: (id: string) => 
    apiClient.request(`/distributions/${id}`),
};

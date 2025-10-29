import { apiClient } from './client';
import { WorkflowConfig, ApprovalRequest, SLAConfig } from '@/types';

export const workflowApi = {
  // Workflow Configs
  getWorkflowConfigs: () =>
    apiClient.request('/workflow-configs').then(res => res.data),
  getWorkflowConfig: (id: string) =>
    apiClient.request(`/workflow-configs/${id}`),
  createWorkflowConfig: (data: Partial<WorkflowConfig>) =>
    apiClient.request('/workflow-configs', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflowConfig: (id: string, data: Partial<WorkflowConfig>) =>
    apiClient.request(`/workflow-configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkflowConfig: (id: string) =>
    apiClient.request(`/workflow-configs/${id}`, { method: 'DELETE' }),
  toggleWorkflowConfig: (id: string, active: boolean) =>
    apiClient.request(`/workflow-configs/${id}/toggle`, { 
      method: 'PATCH', 
      body: JSON.stringify({ active }) 
    }),

  // Approval Requests
  getApprovalRequests: () =>
    apiClient.request('/approval-requests').then(res => res.data),
  getApprovalRequest: (id: string) =>
    apiClient.request(`/approval-requests/${id}`),
  approveRequest: (id: string, remarks?: string) =>
    apiClient.request(`/approval-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),
  rejectRequest: (id: string, remarks: string) =>
    apiClient.request(`/approval-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),
  getApprovalHistory: (requestId: string) =>
    apiClient.request(`/approval-requests/${requestId}/history`).then(res => res.data),

  // SLA Configs
  getSLAConfigs: () =>
    apiClient.request('/sla-configs').then(res => res.data),
  getSLAConfig: (id: string) =>
    apiClient.request(`/sla-configs/${id}`),
  createSLAConfig: (data: Partial<SLAConfig>) =>
    apiClient.request('/sla-configs', { method: 'POST', body: JSON.stringify(data) }),
  updateSLAConfig: (id: string, data: Partial<SLAConfig>) =>
    apiClient.request(`/sla-configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSLAConfig: (id: string) =>
    apiClient.request(`/sla-configs/${id}`, { method: 'DELETE' }),
  getSLAMetrics: (id: string) =>
    apiClient.request(`/sla-configs/${id}/metrics`),
};

import { apiClient } from './client';
import { WorkflowConfig, ApprovalRequest, SLAConfig } from '@/types';

const WORKFLOW_BASE = '/workflow';

export const workflowApi = {
  // Workflow Configs
  getWorkflowConfigs: () =>
    apiClient.request(`${WORKFLOW_BASE}/configs`).then(res => res.data),
  getWorkflowConfig: (id: string) =>
    apiClient.request(`${WORKFLOW_BASE}/configs/${id}`),
  createWorkflowConfig: (data: Partial<WorkflowConfig>) =>
    apiClient.request(`${WORKFLOW_BASE}/configs`, { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflowConfig: (id: string, data: Partial<WorkflowConfig>) =>
    apiClient.request(`${WORKFLOW_BASE}/configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkflowConfig: (id: string) =>
    apiClient.request(`${WORKFLOW_BASE}/configs/${id}`, { method: 'DELETE' }),
  toggleWorkflowConfig: (id: string, active: boolean) =>
    apiClient.request(`${WORKFLOW_BASE}/configs/${id}/toggle`, { 
      method: 'PATCH', 
      body: JSON.stringify({ active }) 
    }),

  // Approval Requests
  getApprovalRequests: () =>
    apiClient.request(`${WORKFLOW_BASE}/approvals`).then(res => res.data),
  getApprovalRequest: (id: string) =>
    apiClient.request(`${WORKFLOW_BASE}/approvals/${id}`),
  approveRequest: (id: string, remarks?: string) =>
    apiClient.request(`${WORKFLOW_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),
  rejectRequest: (id: string, remarks: string) =>
    apiClient.request(`${WORKFLOW_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),
  getApprovalHistory: (requestId: string) =>
    apiClient.request(`${WORKFLOW_BASE}/approvals/${requestId}/history`).then(res => res.data),

  // SLA Configs
  getSLAConfigs: () =>
    apiClient.request(`${WORKFLOW_BASE}/sla`).then(res => res.data),
  getSLAConfig: (id: string) =>
    apiClient.request(`${WORKFLOW_BASE}/sla/${id}`),
  createSLAConfig: (data: Partial<SLAConfig>) =>
    apiClient.request(`${WORKFLOW_BASE}/sla`, { method: 'POST', body: JSON.stringify(data) }),
  updateSLAConfig: (id: string, data: Partial<SLAConfig>) =>
    apiClient.request(`${WORKFLOW_BASE}/sla/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSLAConfig: (id: string) =>
    apiClient.request(`${WORKFLOW_BASE}/sla/${id}`, { method: 'DELETE' }),
  getSLAMetrics: (id: string) =>
    apiClient.request(`${WORKFLOW_BASE}/sla/${id}/metrics`),
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowConfig, ApprovalRequest, SLAConfig } from '@/types';
import { workflowApi } from '../api/workflowApi';
import { useToast } from '@/hooks/use-toast';

// Workflow Configs
export const useWorkflowConfigs = () => {
  return useQuery({
    queryKey: ['workflow-configs'],
    queryFn: () => workflowApi.getWorkflowConfigs(),
  });
};

export const useWorkflowConfig = (id?: string) => {
  return useQuery({
    queryKey: ['workflow-configs', id],
    queryFn: () => workflowApi.getWorkflowConfig(id!),
    enabled: !!id,
  });
};

export const useCreateWorkflowConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: workflowApi.createWorkflowConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-configs'] });
      toast({ title: 'Success', description: 'Workflow created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create workflow', variant: 'destructive' });
    },
  });
};

export const useUpdateWorkflowConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowConfig> }) =>
      workflowApi.updateWorkflowConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-configs'] });
      toast({ title: 'Success', description: 'Workflow updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update workflow', variant: 'destructive' });
    },
  });
};

export const useDeleteWorkflowConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: workflowApi.deleteWorkflowConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-configs'] });
      toast({ title: 'Success', description: 'Workflow deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete workflow', variant: 'destructive' });
    },
  });
};

export const useToggleWorkflowConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      workflowApi.toggleWorkflowConfig(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-configs'] });
      toast({ title: 'Success', description: 'Workflow status updated' });
    },
  });
};

// Approval Requests
export const useApprovalRequests = () => {
  return useQuery({
    queryKey: ['approval-requests'],
    queryFn: () => workflowApi.getApprovalRequests(),
  });
};

export const useApprovalRequest = (id?: string) => {
  return useQuery({
    queryKey: ['approval-requests', id],
    queryFn: () => workflowApi.getApprovalRequest(id!),
    enabled: !!id,
  });
};

export const useApprovalHistory = (requestId?: string) => {
  return useQuery({
    queryKey: ['approval-history', requestId],
    queryFn: () => workflowApi.getApprovalHistory(requestId!),
    enabled: !!requestId,
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      workflowApi.approveRequest(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      toast({ title: 'Success', description: 'Request approved successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' });
    },
  });
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      workflowApi.rejectRequest(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      toast({ title: 'Success', description: 'Request rejected successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reject request', variant: 'destructive' });
    },
  });
};

// SLA Configs
export const useSLAConfigs = () => {
  return useQuery({
    queryKey: ['sla-configs'],
    queryFn: () => workflowApi.getSLAConfigs(),
  });
};

export const useSLAConfig = (id?: string) => {
  return useQuery({
    queryKey: ['sla-configs', id],
    queryFn: () => workflowApi.getSLAConfig(id!),
    enabled: !!id,
  });
};

export const useCreateSLAConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: workflowApi.createSLAConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-configs'] });
      toast({ title: 'Success', description: 'SLA created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create SLA', variant: 'destructive' });
    },
  });
};

export const useUpdateSLAConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SLAConfig> }) =>
      workflowApi.updateSLAConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-configs'] });
      toast({ title: 'Success', description: 'SLA updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update SLA', variant: 'destructive' });
    },
  });
};

export const useDeleteSLAConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: workflowApi.deleteSLAConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-configs'] });
      toast({ title: 'Success', description: 'SLA deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete SLA', variant: 'destructive' });
    },
  });
};

export const useSLAMetrics = (id?: string) => {
  return useQuery({
    queryKey: ['sla-metrics', id],
    queryFn: () => workflowApi.getSLAMetrics(id!),
    enabled: !!id,
  });
};

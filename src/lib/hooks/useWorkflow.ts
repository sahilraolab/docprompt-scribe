import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowConfig, ApprovalRequest } from '@/types';

export const useWorkflowConfigs = () => {
  return useQuery<WorkflowConfig[]>({
    queryKey: ['workflow-configs'],
    queryFn: async () => {
      const res = await fetch('/api/workflow-configs');
      const data = await res.json();
      return data.data;
    },
  });
};

export const useApprovalRequests = () => {
  return useQuery<ApprovalRequest[]>({
    queryKey: ['approval-requests'],
    queryFn: async () => {
      const res = await fetch('/api/approval-requests');
      const data = await res.json();
      return data.data;
    },
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks?: string }) => {
      const res = await fetch(`/api/approval-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
    },
  });
};

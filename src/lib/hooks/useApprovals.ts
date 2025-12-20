import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { workflowApi } from '@/lib/api/workflowApi';

interface ApproveRequestParams {
  id: string;
  action: 'approve' | 'reject';
  remarks?: string;
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, action, remarks }: ApproveRequestParams) => {
      if (action === 'approve') {
        return workflowApi.approveRequest(id, remarks);
      } else {
        return workflowApi.rejectRequest(id, remarks || '');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      toast({
        title: variables.action === 'approve' ? 'Approved' : 'Rejected',
        description: `Request has been ${variables.action}d successfully.`,
      });
    },
    onError: (error, variables) => {
      toast({
        title: 'Error',
        description: `Failed to ${variables.action} request. Please try again.`,
        variant: 'destructive',
      });
    },
  });
}

export function useBulkApprove() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const promises = ids.map(id => workflowApi.approveRequest(id));
      const results = await Promise.all(promises);
      return results;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      
      toast({
        title: 'Bulk Approval Complete',
        description: `${ids.length} requests approved successfully.`,
      });
    },
  });
}

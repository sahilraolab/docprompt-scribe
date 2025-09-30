import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const response = await fetch(`/api/approval-requests/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }

      return response.json();
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
      const promises = ids.map(id =>
        fetch(`/api/approval-requests/${id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

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

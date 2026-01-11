import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimatesApi } from '@/lib/api/engineeringApi';
import { toast } from 'sonner';

export function useEstimates(projectId?: number) {
  return useQuery({
    queryKey: ['estimates', 'project', projectId],
    queryFn: async () => {
      const response = await estimatesApi.list(projectId!);
      return response || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; name: string; baseAmount: number }) =>
      estimatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create estimate');
    },
  });
}

export function useAddEstimateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { estimateId: number; amount: number }) =>
      estimatesApi.addVersion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate version added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add estimate version');
    },
  });
}

export function useApproveEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => estimatesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve estimate');
    },
  });
}

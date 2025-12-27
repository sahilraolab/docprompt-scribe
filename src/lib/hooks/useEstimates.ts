import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimatesApi } from '@/lib/api/engineeringApi';
import { toast } from 'sonner';

export function useEstimates(projectId?: string) {
  return useQuery({
    queryKey: ['estimates', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await estimatesApi.getAll(projectId);
      return response.data;
    },
  });
}

export function useEstimate(id: string) {
  return useQuery({
    queryKey: ['estimates', id],
    queryFn: async () => {
      const response = await estimatesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => estimatesApi.create(data),
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
    mutationFn: (data: any) => estimatesApi.addVersion(data),
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
    mutationFn: (id: string) => estimatesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve estimate');
    },
  });
}

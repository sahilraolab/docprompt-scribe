import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '@/lib/api/engineeringApi';
import { toast } from 'sonner';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await plansApi.getAll();
      return response.data;
    },
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: async () => {
      const response = await plansApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create plan');
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => plansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update plan');
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete plan');
    },
  });
}

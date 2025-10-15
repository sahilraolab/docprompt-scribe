import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boqApi } from '@/lib/api/materialMasterApi';
import { toast } from 'sonner';

export function useBOQs() {
  return useQuery({
    queryKey: ['boqs'],
    queryFn: async () => {
      const response = await boqApi.getAll() as any;
      return response.data || response;
    },
  });
}

export function useBOQ(id: string) {
  return useQuery({
    queryKey: ['boqs', id],
    queryFn: async () => {
      const response = await boqApi.getById(id) as any;
      return response.data || response;
    },
    enabled: !!id,
  });
}

export function useCreateBOQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => boqApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      toast.success('BOQ created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create BOQ');
    },
  });
}

export function useUpdateBOQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => boqApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      toast.success('BOQ updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update BOQ');
    },
  });
}

export function useDeleteBOQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => boqApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      toast.success('BOQ deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete BOQ');
    },
  });
}

export function useApproveBOQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => boqApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      toast.success('BOQ approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve BOQ');
    },
  });
}

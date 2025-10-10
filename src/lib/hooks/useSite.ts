import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Item, Stock } from '@/types';
import { itemApi } from '@/lib/api/purchaseApi';
import { toast } from 'sonner';
import { mockItems } from '@/lib/msw/data/items-mock';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      try {
        const response = await itemApi.getAll() as any;
        const data = response.data || response;
        // Use mock data if API returns empty or fails
        return data && data.length > 0 ? data : mockItems;
      } catch (error) {
        console.warn('Items API not available, using mock data');
        return mockItems;
      }
    },
  });
}

export function useStock() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: async () => {
      const response = await itemApi.getStock() as any;
      return response.data || response;
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => itemApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create item');
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => itemApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });
}

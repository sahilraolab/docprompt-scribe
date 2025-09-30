import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types';

export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      return data.data;
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { User } from '@/types';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      return data.data;
    },
  });
};

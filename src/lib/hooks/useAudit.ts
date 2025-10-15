import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api/auditApi';

export function useAuditTrail(params?: { 
  module?: string; 
  action?: string; 
  startDate?: string; 
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['audit-trail', params],
    queryFn: async () => {
      const response = await auditApi.getAll(params);
      return response.data;
    },
  });
}

export function useAuditEntry(id: string) {
  return useQuery({
    queryKey: ['audit-trail', id],
    queryFn: async () => {
      const response = await auditApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

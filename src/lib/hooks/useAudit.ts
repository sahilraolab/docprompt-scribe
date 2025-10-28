// src/lib/hooks/useAudit.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "@/lib/api/auditApi";
import { toast } from "sonner";

export function useAuditTrail(params?: {
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["audit-trail", params],
    queryFn: async () => {
      const response = await auditApi.getAll(params);
      return response.data?.data || []; // backend returns { success, data }
    },
  });
}

export function useAuditEntry(id: string) {
  return useQuery({
    queryKey: ["audit-trail", id],
    queryFn: async () => {
      const response = await auditApi.getById(id);
      return response.data?.data;
    },
    enabled: !!id,
  });
}

// ✅ Create new audit log
export function useCreateAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      module: string;
      action: string;
      entityType: string;
      entityId?: string;
      details?: string;
    }) => {
      const response = await auditApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-trail"] });
      toast.success("Audit log recorded");
    },
    onError: (error: any) => {
      console.error("Audit error:", error);
      toast.error("Failed to record audit log");
    },
  });
}

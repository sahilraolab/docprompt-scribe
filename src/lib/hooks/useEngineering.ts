import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  estimatesApi, 
  budgetApi,
  bbsApi,
  drawingsApi,
  complianceApi
} from '@/lib/api/engineeringApi';
import { toast } from 'sonner';

// ==================== BUDGET ====================
export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await budgetApi.getAll();
      return response.data || [];
    },
  });
}

export function useBudget(projectId: string) {
  return useQuery({
    queryKey: ['budgets', projectId],
    queryFn: async () => {
      const response = await budgetApi.getByProject(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget');
    },
  });
}

export function useApproveBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve budget');
    },
  });
}

// ==================== ESTIMATES ====================
export function useEstimates(projectId?: string) {
  return useQuery({
    queryKey: ['estimates', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await estimatesApi.getAll(projectId);
      return response.data || [];
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

export function useEstimatesByProject(projectId: string) {
  return useQuery({
    queryKey: ['estimates', 'project', projectId],
    queryFn: async () => {
      const response = await estimatesApi.getByProject(projectId);
      return response.data || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: estimatesApi.create,
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
    mutationFn: estimatesApi.addVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate version added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add version');
    },
  });
}

export function useApproveEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: estimatesApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate finalized successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to finalize estimate');
    },
  });
}

// ==================== BBS ====================
export function useBBSList(projectId?: string) {
  return useQuery({
    queryKey: ['bbs', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await bbsApi.getAll(projectId);
      return response.data || [];
    },
  });
}

export function useBBS(id: string) {
  return useQuery({
    queryKey: ['bbs', id],
    queryFn: async () => {
      const response = await bbsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBBS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bbsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bbs'] });
      toast.success('BBS created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create BBS');
    },
  });
}

export function useUpdateBBS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bbsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bbs'] });
      toast.success('BBS updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update BBS');
    },
  });
}

export function useDeleteBBS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bbsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bbs'] });
      toast.success('BBS deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete BBS');
    },
  });
}

export function useApproveBBS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bbsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bbs'] });
      toast.success('BBS approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve BBS');
    },
  });
}

// ==================== DRAWINGS ====================
export function useDrawings(projectId?: string) {
  return useQuery({
    queryKey: ['drawings', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await drawingsApi.getByProject(projectId);
      return response.data || [];
    },
  });
}

export function useDrawing(id: string) {
  return useQuery({
    queryKey: ['drawings', id],
    queryFn: async () => {
      const response = await drawingsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateDrawing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: drawingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
      toast.success('Drawing created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create drawing');
    },
  });
}

export function useReviseDrawing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: drawingsApi.revise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
      toast.success('Drawing revision added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revise drawing');
    },
  });
}

export function useApproveDrawing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: drawingsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
      toast.success('Drawing approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve drawing');
    },
  });
}

// ==================== COMPLIANCE ====================
// export function useCompliances(projectId?: string) {
//   return useQuery({
//     queryKey: ['compliances', projectId].filter(Boolean),
//     queryFn: async () => {
//       const response = await complianceApi.getAll(projectId);
//       return response.data || [];
//     },
//   });
// }

// export function useCompliance(id: string) {
//   return useQuery({
//     queryKey: ['compliances', id],
//     queryFn: async () => {
//       const response = await complianceApi.getById(id);
//       return response.data;
//     },
//     enabled: !!id,
//   });
// }

export function useCompliances(projectId?: number) {
  return useQuery({
    queryKey: ['compliances', 'project', projectId],
    queryFn: async () => {
      const res = await complianceApi.getByProject(projectId!);
      return res || [];
    },
    enabled: !!projectId,
  });
}

export function useCompliance(id?: number) {
  return useQuery({
    queryKey: ['compliance', id], // 🔥 UNIQUE KEY
    queryFn: async () => {
      const res = await complianceApi.getById(id!);
      return res; // 🔥 NOT res.data
    },
    enabled: !!id,
  });
}

export function useCreateCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complianceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      toast.success('Compliance record created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create compliance');
    },
  });
}

// export function useUpdateCompliance() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: any }) => complianceApi.update(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['compliances'] });
//       toast.success('Compliance updated');
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || 'Failed to update compliance');
//     },
//   });
// }

export function useUpdateCompliance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      complianceApi.update(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      queryClient.invalidateQueries({ queryKey: ['compliance', id] });
      toast.success('Compliance updated');
    },
  });
}

export function useDeleteCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complianceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      toast.success('Compliance deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete compliance');
    },
  });
}

// ==================== HELPER HOOKS FOR PURCHASE MODULE ====================
// Get only APPROVED budgets for Purchase module
export function useApprovedBudgets() {
  return useQuery({
    queryKey: ['budgets', 'approved'],
    queryFn: async () => {
      const response = await budgetApi.getAll();
      const budgets = Array.isArray(response.data) ? response.data : [];
      return budgets.filter((b: any) => b.status === 'APPROVED');
    },
  });
}

// Get only FINAL estimates for Purchase module
export function useFinalEstimates(projectId?: string) {
  return useQuery({
    queryKey: ['estimates', 'final', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await estimatesApi.getAll(projectId);
      const estimates = Array.isArray(response.data) ? response.data : [];
      return estimates.filter((e: any) => e.status === 'FINAL');
    },
    enabled: projectId ? !!projectId : true,
  });
}

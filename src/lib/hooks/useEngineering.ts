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

/** List all budgets with optional filters */
export function useBudgets(params?: { projectId?: number; status?: string }) {
  return useQuery({
    queryKey: ['budgets', params],
    queryFn: async () => {
      const response = await budgetApi.list(params);
      return response || [];
    },
  });
}

/** Get budget for a specific project */
export function useBudget(projectId?: number) {
  return useQuery({
    queryKey: ['budgets', 'project', projectId],
    queryFn: async () => {
      const response = await budgetApi.getByProject(projectId!);
      return response;
    },
    enabled: !!projectId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; totalBudget: number }) => 
      budgetApi.create(data),
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
    mutationFn: (id: number) => budgetApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve budget');
    },
  });
}

export function useImportBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => budgetApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget imported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import budget');
    },
  });
}

// ==================== ESTIMATES ====================

/** List estimates for a project */
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
    mutationFn: (id: number) => estimatesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate finalized successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to finalize estimate');
    },
  });
}

export function useImportEstimates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => estimatesApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimates imported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import estimates');
    },
  });
}

// ==================== BBS (BOQ) ====================

/** List BBS for a project */
export function useBBSList(projectId?: number) {
  return useQuery({
    queryKey: ['bbs', 'project', projectId],
    queryFn: async () => {
      const response = await bbsApi.list(projectId!);
      return response || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateBBS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      projectId: number;
      estimateId: number;
      description?: string;
      quantity: number;
      uomId: number;
      rate: number;
    }) => bbsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bbs'] });
      toast.success('BBS created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create BBS');
    },
  });
}

export function useApproveBBS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bbsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bbs'] });
      toast.success('BBS approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve BBS');
    },
  });
}

export function useImportBBS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => bbsApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bbs'] });
      toast.success('BBS imported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import BBS');
    },
  });
}

// ==================== DRAWINGS ====================

/** List drawings for a project */
export function useDrawings(projectId?: number) {
  return useQuery({
    queryKey: ['drawings', 'project', projectId],
    queryFn: async () => {
      const response = await drawingsApi.list(projectId!);
      return response || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateDrawing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      projectId: number;
      title: string;
      discipline?: string;
      file?: File;
    }) => drawingsApi.create(data),
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
    mutationFn: (data: { drawingId: number; changeNote: string }) =>
      drawingsApi.revise(data),
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
    mutationFn: (id: number) => drawingsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
      toast.success('Drawing approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve drawing');
    },
  });
}

export function useApproveDrawingRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => drawingsApi.approveRevision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
      toast.success('Drawing revision approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve revision');
    },
  });
}

// ==================== COMPLIANCE ====================

/** List compliances for a project */
export function useCompliances(projectId?: number) {
  return useQuery({
    queryKey: ['compliances', 'project', projectId],
    queryFn: async () => {
      const response = await complianceApi.list(projectId!);
      return response || [];
    },
    enabled: !!projectId,
  });
}

/** Get single compliance by ID */
export function useCompliance(id?: number) {
  return useQuery({
    queryKey: ['compliance', id],
    queryFn: async () => {
      const response = await complianceApi.getById(id!);
      return response;
    },
    enabled: !!id,
  });
}

export function useCreateCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      projectId: number;
      type: string;
      documentRef?: string | null;
      validTill?: string | null;
      blocking?: boolean;
      file?: File;
    }) => complianceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      toast.success('Compliance record created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create compliance');
    },
  });
}

export function useUpdateCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: number; 
      data: {
        type: string;
        documentRef?: string | null;
        validTill?: string | null;
        blocking?: boolean;
      }
    }) => complianceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      queryClient.invalidateQueries({ queryKey: ['compliance', id] });
      toast.success('Compliance updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update compliance');
    },
  });
}

export function useCloseCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => complianceApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      toast.success('Compliance closed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to close compliance');
    },
  });
}

// ==================== HELPER HOOKS FOR PURCHASE MODULE ====================

/** Get only APPROVED budgets */
export function useApprovedBudgets() {
  return useQuery({
    queryKey: ['budgets', 'approved'],
    queryFn: async () => {
      const response = await budgetApi.list({ status: 'APPROVED' });
      return response || [];
    },
  });
}

/** Get only FINAL estimates for a project */
export function useFinalEstimates(projectId?: number) {
  return useQuery({
    queryKey: ['estimates', 'final', projectId],
    queryFn: async () => {
      const response = await estimatesApi.list(projectId!);
      const estimates = Array.isArray(response) ? response : [];
      return estimates.filter((e: any) => e.status === 'FINAL');
    },
    enabled: !!projectId,
  });
}

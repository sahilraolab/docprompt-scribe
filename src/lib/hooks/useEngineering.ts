import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  projectsApi, 
  estimatesApi, 
  documentsApi, 
  plansApi,
  budgetApi,
  bbsApi,
  drawingsApi,
  complianceApi
} from '@/lib/api/engineeringApi';
import { toast } from 'sonner';

// ==================== PROJECTS ====================
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data;
    }
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await projectsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });
}

// ==================== BUDGET ====================
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

export function useEstimatesByProject(projectId: string) {
  return useQuery({
    queryKey: ['estimates', 'project', projectId],
    queryFn: async () => {
      const response = await estimatesApi.getByProject(projectId);
      return response.data;
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
      toast.success('Estimate approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve estimate');
    },
  });
}

// ==================== BBS ====================
export function useBBSList(projectId?: string) {
  return useQuery({
    queryKey: ['bbs', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await bbsApi.getAll(projectId);
      return response.data;
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

// ==================== DRAWINGS ====================
export function useDrawings(projectId?: string) {
  return useQuery({
    queryKey: ['drawings', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await drawingsApi.getAll(projectId);
      return response.data;
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
export function useCompliances(projectId?: string) {
  return useQuery({
    queryKey: ['compliances', projectId].filter(Boolean),
    queryFn: async () => {
      const response = await complianceApi.getAll(projectId);
      return response.data;
    },
  });
}

export function useCompliance(id: string) {
  return useQuery({
    queryKey: ['compliances', id],
    queryFn: async () => {
      const response = await complianceApi.getById(id);
      return response.data;
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

export function useUpdateCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => complianceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      toast.success('Compliance updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update compliance');
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

// ==================== DOCUMENTS ====================
export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await documentsApi.getAll();
      return response.data;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const response = await documentsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useDocumentsByProject(projectId: string) {
  return useQuery({
    queryKey: ['documents', 'project', projectId],
    queryFn: async () => {
      const response = await documentsApi.getByProject(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => documentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update document');
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });
}

// ==================== PLANS ====================
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

export function usePlansByProject(projectId: string) {
  return useQuery({
    queryKey: ['plans', 'project', projectId],
    queryFn: async () => {
      const response = await plansApi.getByProject(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: plansApi.create,
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
    mutationFn: plansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete plan');
    },
  });
}

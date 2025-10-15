import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, estimatesApi, documentsApi, plansApi } from '@/lib/api/engineeringApi';
import { toast } from 'sonner';

// Projects hooks
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
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

// Estimates hooks
export function useEstimates() {
  return useQuery({
    queryKey: ['estimates'],
    queryFn: estimatesApi.getAll,
  });
}

export function useEstimate(id: string) {
  return useQuery({
    queryKey: ['estimates', id],
    queryFn: () => estimatesApi.getById(id),
    enabled: !!id,
  });
}

export function useEstimatesByProject(projectId: string) {
  return useQuery({
    queryKey: ['estimates', 'project', projectId],
    queryFn: () => estimatesApi.getByProject(projectId),
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

export function useUpdateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => estimatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update estimate');
    },
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: estimatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete estimate');
    },
  });
}

export function useSubmitEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: estimatesApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit estimate');
    },
  });
}

export function useApproveEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => estimatesApi.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve estimate');
    },
  });
}

export function useRejectEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => estimatesApi.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject estimate');
    },
  });
}

// Documents hooks
export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.getAll,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function useDocumentsByProject(projectId: string) {
  return useQuery({
    queryKey: ['documents', 'project', projectId],
    queryFn: () => documentsApi.getByProject(projectId),
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

// Plans hooks
export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: plansApi.getAll,
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => plansApi.getById(id),
    enabled: !!id,
  });
}

export function usePlansByProject(projectId: string) {
  return useQuery({
    queryKey: ['plans', 'project', projectId],
    queryFn: () => plansApi.getByProject(projectId),
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

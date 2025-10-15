import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialMasterApi, boqApi, mrFromBOQApi } from '../api/materialMasterApi';
import { toast } from 'sonner';

// Material Master Hooks
export const useMaterialMaster = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const response = await materialMasterApi.getAll();
      return response.data;
    },
  });
};

export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: async () => {
      const response = await materialMasterApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useMaterialsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['materials', 'category', category],
    queryFn: async () => {
      const response = await materialMasterApi.getByCategory(category);
      return response.data;
    },
    enabled: !!category,
  });
};

export const useSearchMaterials = (query: string) => {
  return useQuery({
    queryKey: ['materials', 'search', query],
    queryFn: async () => {
      const response = await materialMasterApi.search(query);
      return response.data;
    },
    enabled: query.length > 2,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: materialMasterApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create material');
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => materialMasterApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update material');
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: materialMasterApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete material');
    },
  });
};

// BOQ Hooks
export const useBOQs = () => {
  return useQuery({
    queryKey: ['boq'],
    queryFn: async () => {
      const response = await boqApi.getAll();
      return response.data;
    },
  });
};

export const useBOQ = (id: string) => {
  return useQuery({
    queryKey: ['boq', id],
    queryFn: async () => {
      const response = await boqApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useBOQsByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['boq', 'project', projectId],
    queryFn: async () => {
      const response = await boqApi.getByProject(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });
};

export const useBOQByEstimate = (estimateId: string) => {
  return useQuery({
    queryKey: ['boq', 'estimate', estimateId],
    queryFn: async () => {
      const response = await boqApi.getByEstimate(estimateId);
      return response.data;
    },
    enabled: !!estimateId,
  });
};

export const useCreateBOQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boqApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq'] });
      toast.success('BOQ created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create BOQ');
    },
  });
};

export const useUpdateBOQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => boqApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq'] });
      toast.success('BOQ updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update BOQ');
    },
  });
};

export const useDeleteBOQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boqApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq'] });
      toast.success('BOQ deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete BOQ');
    },
  });
};

export const useGenerateBOQFromEstimate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boqApi.generateFromEstimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq'] });
      toast.success('BOQ generated from estimate');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate BOQ');
    },
  });
};

export const useApproveBOQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boqApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq'] });
      toast.success('BOQ approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve BOQ');
    },
  });
};

// MR from BOQ Hooks
export const useGenerateMRFromBOQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boqId, data }: { boqId: string; data: any }) => 
      mrFromBOQApi.generateFromBOQ(boqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition generated from BOQ');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate MR from BOQ');
    },
  });
};

export const useMRsByBOQ = (boqId: string) => {
  return useQuery({
    queryKey: ['mrs', 'boq', boqId],
    queryFn: async () => {
      const response = await mrFromBOQApi.getMRsByBOQ(boqId);
      return response.data;
    },
    enabled: !!boqId,
  });
};

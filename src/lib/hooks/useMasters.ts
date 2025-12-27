import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  projectsApi, materialsApi, companiesApi, suppliersApi,
  uomsApi, departmentsApi, costCentersApi, taxesApi
} from '@/lib/api/mastersApi';
import type {
  ProjectFormData, MaterialFormData, CompanyFormData, SupplierFormData,
  UOMFormData, DepartmentFormData, CostCenterFormData, TaxFormData
} from '@/types/masters';

// ==================== COMPANIES ====================
export function useMasterCompanies() {
  return useQuery({
    queryKey: ['masters', 'companies'],
    queryFn: companiesApi.getAll,
  });
}

export function useMasterCompany(id: number) {
  return useQuery({
    queryKey: ['masters', 'companies', id],
    queryFn: () => companiesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyFormData) => companiesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'companies'] });
      toast.success('Company created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create company'),
  });
}

export function useUpdateMasterCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CompanyFormData> }) =>
      companiesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'companies'] });
      toast.success('Company updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update company'),
  });
}

export function useDeleteMasterCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companiesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'companies'] });
      toast.success('Company deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete company'),
  });
}

// ==================== PROJECTS ====================
export function useMasterProjects() {
  return useQuery({
    queryKey: ['masters', 'projects'],
    queryFn: projectsApi.getAll,
  });
}

export function useMasterProject(id: number) {
  return useQuery({
    queryKey: ['masters', 'projects', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectFormData) => projectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'projects'] });
      toast.success('Project created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create project'),
  });
}

export function useUpdateMasterProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProjectFormData> }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'projects'] });
      toast.success('Project updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update project'),
  });
}

export function useDeleteMasterProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete project'),
  });
}

// ==================== MATERIALS ====================
export function useMasterMaterials() {
  return useQuery({
    queryKey: ['masters', 'materials'],
    queryFn: materialsApi.getAll,
  });
}

export function useMasterMaterial(id: number) {
  return useQuery({
    queryKey: ['masters', 'materials', id],
    queryFn: () => materialsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MaterialFormData) => materialsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'materials'] });
      toast.success('Material created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create material'),
  });
}

export function useUpdateMasterMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaterialFormData> }) =>
      materialsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'materials'] });
      toast.success('Material updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update material'),
  });
}

export function useDeleteMasterMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => materialsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'materials'] });
      toast.success('Material deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete material'),
  });
}

// ==================== SUPPLIERS ====================
export function useMasterSuppliers() {
  return useQuery({
    queryKey: ['masters', 'suppliers'],
    queryFn: suppliersApi.getAll,
  });
}

export function useMasterSupplier(id: number) {
  return useQuery({
    queryKey: ['masters', 'suppliers', id],
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierFormData) => suppliersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create supplier'),
  });
}

export function useUpdateMasterSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SupplierFormData> }) =>
      suppliersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'suppliers'] });
      toast.success('Supplier updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update supplier'),
  });
}

export function useDeleteMasterSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete supplier'),
  });
}

// ==================== UOMS ====================
export function useMasterUOMs() {
  return useQuery({
    queryKey: ['masters', 'uoms'],
    queryFn: uomsApi.getAll,
  });
}

export function useMasterUOM(id: number) {
  return useQuery({
    queryKey: ['masters', 'uoms', id],
    queryFn: () => uomsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterUOM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UOMFormData) => uomsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'uoms'] });
      toast.success('UOM created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create UOM'),
  });
}

export function useUpdateMasterUOM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UOMFormData> }) =>
      uomsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'uoms'] });
      toast.success('UOM updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update UOM'),
  });
}

export function useDeleteMasterUOM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => uomsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'uoms'] });
      toast.success('UOM deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete UOM'),
  });
}

// ==================== DEPARTMENTS ====================
export function useMasterDepartments() {
  return useQuery({
    queryKey: ['masters', 'departments'],
    queryFn: departmentsApi.getAll,
  });
}

export function useMasterDepartment(id: number) {
  return useQuery({
    queryKey: ['masters', 'departments', id],
    queryFn: () => departmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentFormData) => departmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'departments'] });
      toast.success('Department created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create department'),
  });
}

export function useUpdateMasterDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DepartmentFormData> }) =>
      departmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'departments'] });
      toast.success('Department updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update department'),
  });
}

export function useDeleteMasterDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'departments'] });
      toast.success('Department deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete department'),
  });
}

// ==================== COST CENTERS ====================
export function useMasterCostCenters() {
  return useQuery({
    queryKey: ['masters', 'cost-centers'],
    queryFn: costCentersApi.getAll,
  });
}

export function useMasterCostCenter(id: number) {
  return useQuery({
    queryKey: ['masters', 'cost-centers', id],
    queryFn: () => costCentersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CostCenterFormData) => costCentersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'cost-centers'] });
      toast.success('Cost Center created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create cost center'),
  });
}

export function useUpdateMasterCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CostCenterFormData> }) =>
      costCentersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'cost-centers'] });
      toast.success('Cost Center updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update cost center'),
  });
}

export function useDeleteMasterCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costCentersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'cost-centers'] });
      toast.success('Cost Center deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete cost center'),
  });
}

// ==================== TAXES ====================
export function useMasterTaxes() {
  return useQuery({
    queryKey: ['masters', 'taxes'],
    queryFn: taxesApi.getAll,
  });
}

export function useMasterTax(id: number) {
  return useQuery({
    queryKey: ['masters', 'taxes', id],
    queryFn: () => taxesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMasterTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaxFormData) => taxesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'taxes'] });
      toast.success('Tax created successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create tax'),
  });
}

export function useUpdateMasterTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaxFormData> }) =>
      taxesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'taxes'] });
      toast.success('Tax updated successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update tax'),
  });
}

export function useDeleteMasterTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taxesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['masters', 'taxes'] });
      toast.success('Tax deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete tax'),
  });
}
